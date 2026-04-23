import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: reqs, error } = await supabase
      .from("client_requests")
      .select("*")
      .eq("lawyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load requests");
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      (reqs ?? []).map(async (r) => {
        const [{ data: profile }, { data: caseRow }] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("user_id", r.client_id).maybeSingle(),
          r.case_id
            ? supabase.from("cases").select("title, category").eq("id", r.case_id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        return {
          ...r,
          client_name: profile?.full_name ?? "Client",
          case_title: caseRow?.title,
          case_category: caseRow?.category,
        } as RequestRow;
      })
    );
    setRequests(enriched);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const updateStatus = async (id: string, status: "accepted" | "declined") => {
    setActingId(id);
    const { error } = await supabase.from("client_requests").update({ status }).eq("id", id);
    setActingId(null);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success(`Request ${status}`);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

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

          {loading ? (
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
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actingId === request.id}
                            onClick={() => updateStatus(request.id, "declined")}
                          >
                            Decline
                          </Button>
                          <Button size="sm" disabled={actingId === request.id} onClick={() => updateStatus(request.id, "accepted")}>
                            {actingId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
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
