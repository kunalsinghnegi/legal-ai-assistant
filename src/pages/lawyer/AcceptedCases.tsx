import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

type AcceptedCase = {
  id: string; // client_request id
  case_id: string;
  client_name: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  created_at: string;
};

const AcceptedCases = () => {
  const { user } = useAuth();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["accepted_cases", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch accepted requests
      const { data: reqs, error } = await supabase
        .from("client_requests")
        .select("*")
        .eq("lawyer_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (!reqs || reqs.length === 0) return [];

      // Enrich with case and profile data
      const enriched = await Promise.all(
        reqs.map(async (r: any) => {
          if (!r.case_id) return null;
          
          const [{ data: profile }, { data: caseRow }] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("user_id", r.client_id).maybeSingle(),
            supabase.from("cases").select("*").eq("id", r.case_id).maybeSingle(),
          ]);
          
          if (!caseRow) return null;

          return {
            id: r.id,
            case_id: r.case_id,
            client_name: profile?.full_name ?? "Unknown Client",
            title: caseRow.title,
            category: caseRow.category,
            urgency: caseRow.urgency,
            status: caseRow.status,
            created_at: caseRow.created_at,
          } as AcceptedCase;
        })
      );
      
      return enriched.filter(Boolean) as AcceptedCase[];
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "in_progress": return "secondary";
      case "closed": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📂 My Accepted Cases</h1>
            <p className="text-muted-foreground">Manage the active cases you have accepted</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : cases.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                <FileText className="h-12 w-12 text-muted mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No accepted cases yet</p>
                <p>When you accept a client request, the case details will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {cases.map((c) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <CardTitle className="text-xl">{c.title}</CardTitle>
                          <Badge variant={getStatusColor(c.status)} className="capitalize">
                            {c.status.replace("_", " ")}
                          </Badge>
                          <Badge variant={c.urgency === "high" ? "destructive" : c.urgency === "medium" ? "default" : "outline"} className="capitalize">
                            {c.urgency} urgency
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            Client: {c.client_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {c.category}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Filed {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                        </CardDescription>
                      </div>
                      <Link to={`/case/${c.case_id}`}>
                        <Button variant="outline" className="gap-2">
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AcceptedCases;
