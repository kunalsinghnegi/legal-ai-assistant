import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, Star, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const LawyerDashboard = () => {
  const { user } = useAuth();

  // Fetch Lawyer Profile & Stats
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["lawyer_dashboard_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const [{ data: profile }, { data: lawyer }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("lawyers").select("*").eq("user_id", user.id).single()
      ]);
      return { profile, lawyer };
    },
    enabled: !!user?.id,
  });

  // Fetch Client Requests
  const { data: requests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ["lawyer_dashboard_requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("client_requests")
        .select(`
          id,
          status,
          created_at,
          client_id,
          cases ( category )
        `)
        .eq("lawyer_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Fetch client profiles
      const clientIds = data.map(r => r.client_id);
      let profilesData: any[] = [];
      if (clientIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", clientIds);
        profilesData = profs || [];
      }

      return data.map((req: any) => ({
        ...req,
        clientName: profilesData.find(p => p.user_id === req.client_id)?.full_name || "Unknown Client",
        caseCategory: req.cases?.category || "General Consultation"
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch Appointments (to calculate active cases)
  const { data: activeAppointments = [] } = useQuery({
    queryKey: ["lawyer_dashboard_appointments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("id")
        .eq("lawyer_id", user.id)
        .neq("status", "cancelled");
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const lawyerName = profileData?.profile?.full_name || "Advocate";
  const rating = profileData?.lawyer?.average_rating || 0;
  const casesWon = profileData?.lawyer?.total_reviews || 0; // Using reviews as proxy for now

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {lawyerName}! ⚖️</h1>
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
                  <p className="text-3xl font-bold">{requests.length}</p>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{activeAppointments.length}</p>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{casesWon}</p>
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
                  <p className="text-3xl font-bold">{rating}</p>
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
                  {isRequestsLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : requests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No pending requests right now.</p>
                  ) : (
                    requests.map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.clientName}`} />
                            <AvatarFallback>{request.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.clientName}</h3>
                            <p className="text-sm text-muted-foreground">{request.caseCategory}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="capitalize">
                            {request.status}
                          </Badge>
                          <Link to="/lawyer/client-requests">
                            <Button size="sm">Review</Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
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
                    <div className="p-3 rounded-lg border border-border text-center py-6 text-muted-foreground text-sm">
                      AI Case matching will appear here as you handle more cases.
                    </div>
                  </div>
                  <Link to="/lawyer/recommended-cases">
                    <Button variant="link" className="w-full mt-4">View All Recommendations →</Button>
                  </Link>
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
