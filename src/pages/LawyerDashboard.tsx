import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, Star, CheckCircle, Clock, TrendingUp } from "lucide-react";

const LawyerDashboard = () => {
  const clientRequests = [
    { id: 1, name: "Kunal Sharma", caseType: "Property Dispute", date: "2 hours ago", status: "new" },
    { id: 2, name: "Priya Patel", caseType: "Divorce Case", date: "5 hours ago", status: "pending" },
    { id: 3, name: "Amit Kumar", caseType: "Criminal Defense", date: "1 day ago", status: "reviewed" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Adv. Rajesh Kumar! ⚖️</h1>
            <p className="text-muted-foreground">Manage your cases and client consultations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">8</p>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">24</p>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cases Won</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">150</p>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">4.8</p>
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Requests */}
          <div id="requests">
            <h2 className="text-2xl font-bold mb-4">🧾 New Client Consult Requests</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {clientRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name}`} />
                          <AvatarFallback>{request.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.name}</h3>
                          <p className="text-sm text-muted-foreground">{request.caseType}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {request.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={request.status === "new" ? "default" : "secondary"}>
                          {request.status}
                        </Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case Repository */}
          <div id="cases">
            <h2 className="text-2xl font-bold mb-4">📁 Case Repository</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle className="text-lg">Recommended Similar Cases</CardTitle>
                  <CardDescription>Cases matching your expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">Property Dispute Case #{i}</h4>
                          <Badge variant="outline" className="text-xs">Match: 95%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Similar to your past successful cases</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="w-full mt-4">View All Recommendations →</Button>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Your success statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "87%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Client Satisfaction</span>
                      <span className="font-semibold">4.8/5</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Response Time</span>
                      <span className="font-semibold text-green-600">Excellent</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerDashboard;
