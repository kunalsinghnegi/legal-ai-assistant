import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Search, Check, X, Users, FileText, TrendingUp, Loader2, ShieldCheck, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Fetch all core data
  const { data, isLoading } = useQuery({
    queryKey: ["admin_data"],
    queryFn: async () => {
      const [
        { data: profiles },
        { data: userRoles },
        { data: lawyers },
        { data: cases },
        { data: appointments }
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
        supabase.from("lawyers").select("*"),
        supabase.from("cases").select("*").order("created_at", { ascending: false }),
        supabase.from("appointments").select("*").order("scheduled_at", { ascending: false })
      ]);

      return {
        profiles: profiles || [],
        userRoles: userRoles || [],
        lawyers: lawyers || [],
        cases: cases || [],
        appointments: appointments || []
      };
    }
  });

  // Verify Lawyer Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string, verified: boolean }) => {
      const { error } = await supabase.from("lawyers").update({ verified }).eq("user_id", userId);
      if (error) throw error;
      return { userId, verified };
    },
    onSuccess: (data) => {
      toast.success(`Lawyer ${data.verified ? "verified" : "unverified"} successfully.`);
      queryClient.invalidateQueries({ queryKey: ["admin_data"] });
    },
    onError: () => {
      toast.error("Failed to update lawyer status.");
    }
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  // --- Data Processing ---

  // Lawyers
  const enrichedLawyers = data.lawyers.map(l => {
    const profile = data.profiles.find(p => p.user_id === l.user_id);
    return { ...l, full_name: profile?.full_name || "Unknown" };
  });

  const filteredLawyers = enrichedLawyers.filter(l => 
    l.full_name.toLowerCase().includes(search.toLowerCase()) ||
    l.bar_id?.toLowerCase().includes(search.toLowerCase()) ||
    l.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  // Users
  const enrichedUsers = data.profiles.map(p => {
    const roleRecord = data.userRoles.find(r => r.user_id === p.user_id);
    return { ...p, role: roleRecord?.role || "unknown" };
  });

  // Cases
  const enrichedCases = data.cases.map(c => {
    const clientProfile = data.profiles.find(p => p.user_id === c.client_id);
    return { ...c, clientName: clientProfile?.full_name || "Unknown Client" };
  });

  // Appointments
  const enrichedAppointments = data.appointments.map(a => {
    const clientProfile = data.profiles.find(p => p.user_id === a.client_id);
    const lawyerProfile = data.profiles.find(p => p.user_id === a.lawyer_id);
    return { 
      ...a, 
      clientName: clientProfile?.full_name || "Unknown",
      lawyerName: lawyerProfile?.full_name || "Unknown"
    };
  });

  // Stats
  const stats = {
    totalUsers: data.profiles.length,
    totalLawyers: data.lawyers.length,
    pendingLawyers: data.lawyers.filter(l => !l.verified).length,
    totalCases: data.cases.length,
    totalAppointments: data.appointments.length,
    upcomingAppointments: data.appointments.filter(a => new Date(a.scheduled_at) > new Date() && a.status !== 'cancelled').length
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform Management & Oversight</p>
            </div>
          </div>
          <Link to="/"><Button variant="ghost">Exit Admin</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid grid-cols-5 md:w-[600px] bg-muted/50">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="lawyers">Lawyers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="appointments">Appts</TabsTrigger>
          </TabsList>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Lawyers</p>
                      <p className="text-3xl font-bold">{stats.totalLawyers}</p>
                    </div>
                    <Scale className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Approvals</p>
                      <p className="text-3xl font-bold">{stats.pendingLawyers}</p>
                    </div>
                    <ShieldCheck className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cases</p>
                      <p className="text-3xl font-bold">{stats.totalCases}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Appts</p>
                      <p className="text-3xl font-bold">{stats.upcomingAppointments}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LAWYERS TAB */}
          <TabsContent value="lawyers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Lawyer Verification</CardTitle>
                    <CardDescription>Verify bar credentials for registered lawyers.</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search lawyers..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Bar ID</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLawyers.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No lawyers found</TableCell></TableRow>
                      ) : (
                        filteredLawyers.map((lawyer) => (
                          <TableRow key={lawyer.user_id}>
                            <TableCell className="font-medium">{lawyer.full_name}</TableCell>
                            <TableCell>{lawyer.bar_id || "—"}</TableCell>
                            <TableCell>{lawyer.experience_years || 0} yrs</TableCell>
                            <TableCell>{lawyer.specialization || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={lawyer.verified ? "default" : "secondary"} className="gap-1">
                                {lawyer.verified && <ShieldCheck className="h-3 w-3" />}
                                {lawyer.verified ? "Verified" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {!lawyer.verified ? (
                                  <Button size="sm" disabled={verifyMutation.isPending && verifyMutation.variables?.userId === lawyer.user_id} onClick={() => verifyMutation.mutate({ userId: lawyer.user_id, verified: true })}>
                                    {(verifyMutation.isPending && verifyMutation.variables?.userId === lawyer.user_id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" />Approve</>}
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" disabled={verifyMutation.isPending && verifyMutation.variables?.userId === lawyer.user_id} onClick={() => verifyMutation.mutate({ userId: lawyer.user_id, verified: false })}>
                                    <X className="h-4 w-4 mr-1" />Revoke
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Directory of all registered clients and lawyers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrichedUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">{user.full_name || "Unnamed User"}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'lawyer' ? 'default' : 'secondary'} className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created_at || new Date()).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CASES TAB */}
          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Cases</CardTitle>
                <CardDescription>Overview of all submitted legal cases.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Filed On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrichedCases.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No cases found</TableCell></TableRow>
                      ) : (
                        enrichedCases.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.title}</TableCell>
                            <TableCell>{c.clientName}</TableCell>
                            <TableCell>{c.category}</TableCell>
                            <TableCell>
                              <Badge variant={c.status === "closed" ? "outline" : "default"}>
                                {c.status?.replace("_", " ") || "open"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APPOINTMENTS TAB */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>Overview of all scheduled and past consultations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Lawyer</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrichedAppointments.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No appointments found</TableCell></TableRow>
                      ) : (
                        enrichedAppointments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">
                              {new Date(a.scheduled_at).toLocaleString()}
                            </TableCell>
                            <TableCell>{a.clientName}</TableCell>
                            <TableCell>{a.lawyerName}</TableCell>
                            <TableCell className="capitalize">{a.mode?.replace("_", " ")}</TableCell>
                            <TableCell>
                              <Badge variant={
                                a.status === 'confirmed' ? 'default' : 
                                a.status === 'completed' ? 'outline' : 
                                a.status === 'cancelled' ? 'destructive' : 'secondary'
                              }>
                                {a.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
