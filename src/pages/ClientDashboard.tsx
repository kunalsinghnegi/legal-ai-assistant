import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Star, Calendar, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DocumentUpload from "@/components/DocumentUpload";

const ClientDashboard = () => {
  const { user } = useAuth();

  // Fetch Client Profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch Cases
  const { data: cases = [], isLoading: isCasesLoading } = useQuery({
    queryKey: ["cases", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch Top Lawyers
  const { data: topLawyers = [], isLoading: isLawyersLoading } = useQuery({
    queryKey: ["top_lawyers"],
    queryFn: async () => {
      const { data: lawyersData, error: lawyersError } = await supabase
        .from("lawyers")
        .select("*")
        .order("average_rating", { ascending: false })
        .limit(3);
        
      if (lawyersError) throw lawyersError;
      if (!lawyersData || lawyersData.length === 0) return [];

      const userIds = lawyersData.map((l: any) => l.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
        
      if (profilesError) throw profilesError;

      return lawyersData.map((lawyer: any) => {
        const profile = profilesData?.find(p => p.user_id === lawyer.user_id);
        return {
          ...lawyer,
          profile
        };
      });
    }
  });

  const firstName = profile?.full_name?.split(" ")[0] || "Client";
  const activeCase = cases.find((c: any) => c.status === "in_progress" || c.status === "open");
  const recentCases = cases.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="client" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}! 👋</h1>
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
                  <FileText className="h-5 w-5 text-primary" />
                  Documents & Case Notes
                </CardTitle>
                <CardDescription>Upload and manage your legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload />
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
                {activeCase ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="truncate max-w-[150px]">{activeCase.title}</span>
                      <Badge variant="outline">{activeCase.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: activeCase.status === 'in_progress' ? "60%" : "20%" }} />
                    </div>
                    <Link to={`/case/${activeCase.id}`}>
                      <Button variant="link" className="p-0 h-auto">View Details →</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">No active cases right now.</p>
                    <Link to="/client/case-summary">
                      <Button variant="outline" size="sm">Submit a Case</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Lawyers Section */}
          <div id="lawyers">
            <h2 className="text-2xl font-bold mb-4">🧑‍⚖️ Top Rated Lawyers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLawyersLoading ? (
                <p className="text-muted-foreground col-span-3">Loading top lawyers...</p>
              ) : topLawyers.length === 0 ? (
                <p className="text-muted-foreground col-span-3">No lawyers found.</p>
              ) : (
                topLawyers.map((lawyer: any) => {
                  const name = lawyer.profile?.full_name || "Advocate";
                  return (
                    <Card key={lawyer.id} className="hover-scale">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                            <AvatarFallback>{name.split(" ").map((n: string) => n[0]).join("").substring(0,2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-lg truncate">{name}</CardTitle>
                            <CardDescription>{lawyer.specialization || "General Practice"}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {lawyer.average_rating || 0} Rating
                          </span>
                          <span className="text-muted-foreground">{lawyer.total_reviews || 0} Cases Won</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/lawyer/${lawyer.user_id}`} className="flex-1">
                            <Button variant="outline" className="w-full">View Profile</Button>
                          </Link>
                          <Link to={`/book-appointment/${lawyer.user_id}`}>
                            <Button className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Book
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Cases */}
          <div id="cases">
            <h2 className="text-2xl font-bold mb-4">📂 Recent Cases</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {isCasesLoading ? (
                    <p className="text-muted-foreground text-center">Loading cases...</p>
                  ) : recentCases.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">You haven't submitted any cases yet.</p>
                      <Link to="/client/case-summary">
                        <Button variant="outline">Submit Your First Case</Button>
                      </Link>
                    </div>
                  ) : (
                    recentCases.map((caseItem: any) => (
                      <Link key={caseItem.id} to={`/case/${caseItem.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors mb-3 last:mb-0">
                          <div className="flex items-center gap-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-semibold">{caseItem.title}</h3>
                              <p className="text-sm text-muted-foreground">Filed on {new Date(caseItem.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant={caseItem.status === "in_progress" ? "default" : "secondary"}>
                            {caseItem.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                  {cases.length > 3 && (
                    <div className="text-center pt-2 mt-4 border-t">
                      <Link to="/client/case-summary" className="text-sm text-primary hover:underline font-medium">
                        View All Cases →
                      </Link>
                    </div>
                  )}
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
