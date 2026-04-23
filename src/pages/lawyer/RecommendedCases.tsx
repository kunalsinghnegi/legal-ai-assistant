import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type RecCase = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  urgency: "low" | "medium" | "high";
  status: string;
  created_at: string;
  matchScore: number;
};

// Compute match score based on category overlap with lawyer specialization
const scoreCase = (caseCategory: string, specialization: string): number => {
  const cat = caseCategory.toLowerCase();
  const specs = specialization.toLowerCase().split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  if (specs.some((s) => cat.includes(s) || s.includes(cat))) return 95;
  if (specs.some((s) => s.split(" ").some((w) => w.length > 3 && cat.includes(w)))) return 80;
  return 60;
};

const RecommendedCases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<RecCase[]>([]);
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(true);
  const [interestedId, setInterestedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: lawyer }, { data: openCases }] = await Promise.all([
        supabase.from("lawyers").select("specialization").eq("user_id", user.id).maybeSingle(),
        supabase.from("cases").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50),
      ]);

      const spec = lawyer?.specialization ?? "";
      setSpecialization(spec);

      const scored = (openCases ?? [])
        .map((c) => ({ ...c, matchScore: scoreCase(c.category, spec) } as RecCase))
        .sort((a, b) => b.matchScore - a.matchScore);

      setCases(scored);
      setLoading(false);
    })();
  }, [user]);

  const expressInterest = async (c: RecCase) => {
    if (!user) return;
    setInterestedId(c.id);
    const { error } = await supabase.from("client_requests").insert({
      client_id: c.client_id,
      lawyer_id: user.id,
      case_id: c.id,
      message: `I'm interested in helping with your case "${c.title}". My specialization aligns with this matter.`,
      status: "pending",
    });
    setInterestedId(null);
    if (error) {
      toast.error(error.message.includes("policy") ? "Only clients can initiate; reach out via platform messaging." : "Failed to send interest");
      return;
    }
    toast.success("Interest sent to client");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📁 Recommended Cases</h1>
            <p className="text-muted-foreground">
              Open cases matched to your specialization{specialization && <>: <span className="font-medium text-foreground">{specialization}</span></>}
            </p>
          </div>

          {!specialization && !loading && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Set your specialization</p>
                  <p className="text-muted-foreground">Update your profile settings to get better case matches.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : cases.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No open cases right now.</CardContent></Card>
          ) : (
            <div className="grid gap-6">
              {cases.map((c) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <CardTitle className="text-xl">{c.title}</CardTitle>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {c.matchScore}% Match
                          </Badge>
                          <Badge variant={c.urgency === "high" ? "destructive" : c.urgency === "medium" ? "default" : "outline"} className="capitalize">
                            {c.urgency} urgency
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {c.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{c.description}</p>
                    <div className="flex justify-end">
                      <Button onClick={() => expressInterest(c)} disabled={interestedId === c.id}>
                        {interestedId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Express Interest"}
                      </Button>
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

export default RecommendedCases;
