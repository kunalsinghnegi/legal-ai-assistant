import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Search, Check, X, Users, FileText, TrendingUp, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type LawyerRow = {
  user_id: string;
  full_name: string;
  bar_id: string;
  experience_years: number;
  specialization: string;
  verified: boolean;
};

const AdminPanel = () => {
  const [lawyers, setLawyers] = useState<LawyerRow[]>([]);
  const [stats, setStats] = useState({ totalLawyers: 0, pending: 0, totalCases: 0, totalClients: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: lawyerRows }, { count: caseCount }, { count: clientCount }] = await Promise.all([
      supabase.from("lawyers").select("user_id, bar_id, experience_years, specialization, verified"),
      supabase.from("cases").select("*", { count: "exact", head: true }),
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "client"),
    ]);

    const ids = (lawyerRows ?? []).map((l) => l.user_id);
    let profilesById: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      profilesById = Object.fromEntries((profs ?? []).map((p) => [p.user_id, p.full_name]));
    }

    const enriched: LawyerRow[] = (lawyerRows ?? []).map((l) => ({
      user_id: l.user_id,
      full_name: profilesById[l.user_id] ?? "Unknown",
      bar_id: l.bar_id,
      experience_years: l.experience_years,
      specialization: l.specialization,
      verified: l.verified,
    }));

    setLawyers(enriched);
    setStats({
      totalLawyers: enriched.length,
      pending: enriched.filter((l) => !l.verified).length,
      totalCases: caseCount ?? 0,
      totalClients: clientCount ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setVerified = async (userId: string, name: string, verified: boolean) => {
    setActingId(userId);
    const { error } = await supabase.from("lawyers").update({ verified }).eq("user_id", userId);
    setActingId(null);
    if (error) {
      toast.error("Update failed");
      return;
    }
    toast.success(`${name} ${verified ? "approved" : "unverified"}`);
    setLawyers((prev) => prev.map((l) => (l.user_id === userId ? { ...l, verified } : l)));
    setStats((s) => ({ ...s, pending: s.pending + (verified ? -1 : 1) }));
  };

  const filtered = lawyers.filter(
    (l) =>
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.bar_id.toLowerCase().includes(search.toLowerCase()) ||
      l.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Lawyer Verification & Management</p>
            </div>
          </div>
          <Link to="/"><Button variant="ghost">Exit Admin</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="hover-scale"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Lawyers</p><p className="text-3xl font-bold">{stats.totalLawyers}</p></div><Users className="h-8 w-8 text-primary" /></div></CardContent></Card>
            <Card className="hover-scale"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Approval</p><p className="text-3xl font-bold">{stats.pending}</p></div><FileText className="h-8 w-8 text-yellow-500" /></div></CardContent></Card>
            <Card className="hover-scale"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Cases</p><p className="text-3xl font-bold">{stats.totalCases}</p></div><TrendingUp className="h-8 w-8 text-green-500" /></div></CardContent></Card>
            <Card className="hover-scale"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Clients</p><p className="text-3xl font-bold">{stats.totalClients}</p></div><Users className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Lawyer Verification</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search lawyers..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
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
                      {filtered.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No lawyers found</TableCell></TableRow>
                      ) : (
                        filtered.map((lawyer) => (
                          <TableRow key={lawyer.user_id}>
                            <TableCell className="font-medium">{lawyer.full_name}</TableCell>
                            <TableCell>{lawyer.bar_id || "—"}</TableCell>
                            <TableCell>{lawyer.experience_years} yrs</TableCell>
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
                                  <Button size="sm" disabled={actingId === lawyer.user_id} onClick={() => setVerified(lawyer.user_id, lawyer.full_name, true)}>
                                    {actingId === lawyer.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" />Approve</>}
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" disabled={actingId === lawyer.user_id} onClick={() => setVerified(lawyer.user_id, lawyer.full_name, false)}>
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
