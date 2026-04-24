import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, FileText, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type RequestRow = {
  id: string;
  client_id: string;
  case_id: string | null;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  client_name?: string;
  case_title?: string;
  case_category?: string;
};

const ClientRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["client_requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: reqs, error } = await supabase
        .from("client_requests")
        .select("*")
        .eq("lawyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!reqs || reqs.length === 0) return [];

      const clientIds = Array.from(new Set(reqs.map(r => r.client_id)));
      const caseIds = Array.from(new Set(reqs.map(r => r.case_id).filter(Boolean))) as string[];

      const [profilesRes, casesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", clientIds),
        caseIds.length > 0 
          ? supabase.from("cases").select("id, title, category").in("id", caseIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profiles = profilesRes.data || [];
      const casesData = casesRes.data || [];

      return reqs.map((r: any) => ({
        ...r,
        client_name: profiles.find(p => p.user_id === r.client_id)?.full_name ?? "Client",
        case_title: casesData.find(c => c.id === r.case_id)?.title,
        case_category: casesData.find(c => c.id === r.case_id)?.category,
      })) as RequestRow[];
    },
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      const { error } = await supabase.from("client_requests").update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: (data) => {
      toast.success(`Request ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ["client_requests", user?.id] });
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧾 Client Consultation Requests</h1>
            <p className="text-muted-foreground">Review and respond to client inquiries</p>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {(["all", "pending", "accepted", "declined"] as const).map((f) => (
              <Badge
                key={f}
                variant={filter === f ? "default" : "outline"}
                className="px-4 py-2 cursor-pointer capitalize"
                onClick={() => setFilter(f)}
              >
                {f} ({counts[f]})
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No requests yet.</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback>{request.client_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg">{request.client_name}</h3>
                            <Badge variant={request.status === "pending" ? "default" : request.status === "accepted" ? "secondary" : "outline"}>
                              {request.status}
                            </Badge>
                          </div>
                          {request.case_title && <p className="text-primary font-medium">{request.case_title}</p>}
                          {request.case_category && <p className="text-xs text-muted-foreground">{request.case_category}</p>}
                          {request.message && <p className="text-sm text-muted-foreground mt-2">{request.message}</p>}
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </span>
                            {request.case_id && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Case attached
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          {request.case_id && (
                            <Link to={`/case/${request.case_id}`}>
                              <Button variant="secondary" size="sm" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                View Case
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === request.id}
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: "declined" })}
                          >
                            Decline
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === request.id} 
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: "accepted" })}
                          >
                            {(updateStatusMutation.isPending && updateStatusMutation.variables?.id === request.id && updateStatusMutation.variables?.status === "accepted") ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientRequests;
