import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Search, Check, X, Eye, Users, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const AdminPanel = () => {
  const [lawyers] = useState([
    { id: 1, name: "Adv. Rajesh Kumar", barId: "D/1234/2010", experience: "15 years", specialization: "Criminal Law", status: "pending" },
    { id: 2, name: "Adv. Priya Sharma", barId: "M/5678/2012", experience: "12 years", specialization: "Civil Law", status: "pending" },
    { id: 3, name: "Adv. Amit Patel", barId: "G/9012/2015", experience: "8 years", specialization: "Property Law", status: "approved" },
    { id: 4, name: "Adv. Sneha Reddy", barId: "H/3456/2018", experience: "5 years", specialization: "Family Law", status: "pending" },
  ]);

  const handleApprove = (id: number, name: string) => {
    toast.success(`${name} has been approved!`);
  };

  const handleReject = (id: number, name: string) => {
    toast.error(`${name} has been rejected.`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Lawyer Verification & Management</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost">Exit Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Lawyers</p>
                    <p className="text-3xl font-bold">156</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Cases</p>
                    <p className="text-3xl font-bold">342</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-3xl font-bold">1,248</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lawyer Verification Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lawyer Verification Requests</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search lawyers..." className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
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
                    {lawyers.map((lawyer) => (
                      <TableRow key={lawyer.id}>
                        <TableCell className="font-medium">{lawyer.name}</TableCell>
                        <TableCell>{lawyer.barId}</TableCell>
                        <TableCell>{lawyer.experience}</TableCell>
                        <TableCell>{lawyer.specialization}</TableCell>
                        <TableCell>
                          <Badge variant={lawyer.status === "approved" ? "default" : "secondary"}>
                            {lawyer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {lawyer.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleApprove(lawyer.id, lawyer.name)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleReject(lawyer.id, lawyer.name)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New lawyer registration", user: "Adv. Neha Gupta", time: "5 minutes ago" },
                  { action: "Case filed", user: "Client: Rahul Verma", time: "15 minutes ago" },
                  { action: "Lawyer approved", user: "Adv. Amit Patel", time: "1 hour ago" },
                  { action: "Appointment booked", user: "Client: Priya Sharma", time: "2 hours ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
