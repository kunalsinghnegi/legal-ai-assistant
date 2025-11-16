import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Upload, Star, Calendar, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
  const topLawyers = [
    { id: 1, name: "Adv. Rajesh Kumar", specialization: "Criminal Law", rating: 4.8, cases: 150 },
    { id: 2, name: "Adv. Priya Sharma", specialization: "Civil Law", rating: 4.9, cases: 200 },
    { id: 3, name: "Adv. Amit Patel", specialization: "Property Law", rating: 4.7, cases: 120 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="client" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Kunal! 👋</h1>
            <p className="text-muted-foreground">Here's your legal assistance dashboard</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ask Legal Question */}
            <Card className="hover-scale cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Ask a Legal Question
                </CardTitle>
                <CardDescription>Get instant AI-powered legal guidance</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/chat-ai">
                  <Input placeholder="Type your question here..." className="mb-2" />
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upload Documents */}
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Documents & Case Notes
                </CardTitle>
                <CardDescription>Upload and manage your legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <p className="text-sm text-muted-foreground mt-2">3 documents uploaded</p>
              </CardContent>
            </Card>

            {/* Case Status */}
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Case Status
                </CardTitle>
                <CardDescription>Track your ongoing cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Property Dispute</span>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "60%" }} />
                  </div>
                  <Link to="/case/1">
                    <Button variant="link" className="p-0 h-auto">View Details →</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Lawyers Section */}
          <div id="lawyers">
            <h2 className="text-2xl font-bold mb-4">🧑‍⚖️ Top Lawyers for Your Case Type</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topLawyers.map((lawyer) => (
                <Card key={lawyer.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lawyer.name}`} />
                        <AvatarFallback>{lawyer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                        <CardDescription>{lawyer.specialization}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {lawyer.rating} Rating
                      </span>
                      <span className="text-muted-foreground">{lawyer.cases} Cases Won</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/lawyer/${lawyer.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">View Profile</Button>
                      </Link>
                      <Link to={`/book-appointment/${lawyer.id}`}>
                        <Button className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Book
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Cases */}
          <div id="cases">
            <h2 className="text-2xl font-bold mb-4">📂 My Case Summary</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Link key={i} to={`/case/${i}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-semibold">Property Dispute Case #{i}</h3>
                            <p className="text-sm text-muted-foreground">Filed on Jan {10 + i}, 2025</p>
                          </div>
                        </div>
                        <Badge>{i === 1 ? "Active" : "Pending"}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
