import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, ArrowLeft, FileText, Calendar, MapPin, Loader2, Star, Briefcase, ShieldCheck, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DocumentUpload from "@/components/DocumentUpload";
import { useAuth } from "@/hooks/useAuth";

const CaseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user } = useAuth();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case_details", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("cases").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch lawyers who expressed interest in this case (only relevant for clients)
  const { data: interestedLawyers = [], isLoading: isLawyersLoading } = useQuery({
    queryKey: ["interested_lawyers", id],
    queryFn: async () => {
      if (!id) return [];
      const { data: requests, error } = await supabase
        .from("client_requests")
        .select("lawyer_id, status, message, created_at")
        .eq("case_id", id)
        .neq("status", "declined");

      if (error) throw error;
      if (!requests || requests.length === 0) return [];

      const enriched = await Promise.all(
        requests.map(async (req: any) => {
          const [{ data: profile }, { data: lawyerRow }] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("user_id", req.lawyer_id).maybeSingle(),
            supabase.from("lawyers").select("specialization, experience_years, average_rating, verified, hourly_rate").eq("user_id", req.lawyer_id).maybeSingle(),
          ]);
          return {
            lawyer_id: req.lawyer_id,
            status: req.status,
            message: req.message,
            created_at: req.created_at,
            full_name: profile?.full_name ?? "Advocate",
            specialization: lawyerRow?.specialization ?? "",
            experience_years: lawyerRow?.experience_years ?? 0,
            average_rating: Number(lawyerRow?.average_rating ?? 0),
            verified: lawyerRow?.verified ?? false,
            hourly_rate: lawyerRow?.hourly_rate ?? null,
          };
        })
      );
      return enriched;
    },
    enabled: !!id && role === "client",
  });

  const similarCases = [
    {
      id: 1,
      title: "Ram Kumar vs State of Delhi",
      court: "Delhi High Court",
      date: "March 15, 2023",
      summary: "Property dispute regarding ancestral land ownership rights and documentation."
    },
    {
      id: 2,
      title: "Sharma Properties Ltd vs Municipal Corp",
      court: "Supreme Court of India",
      date: "January 8, 2024",
      summary: "Landmark case on property tax assessment and municipal jurisdiction."
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Case not found</p>
        <Link to={role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard"}><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">LegalAI</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Case Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{caseData.title}</CardTitle>
                  <CardDescription className="text-base">Case ID: {caseData.id.split('-')[0].toUpperCase()}</CardDescription>
                </div>
                <Badge className="text-sm px-4 py-1 capitalize">{caseData.status.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Filed On</p>
                    <p className="font-medium">{new Date(caseData.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{caseData.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Urgency</p>
                    <p className="font-medium capitalize">{caseData.urgency}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Case Summary</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {caseData.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Case Documents</h3>
                <DocumentUpload />
              </div>

              <div>
                <h3 className="font-semibold mb-3">Case Timeline</h3>
                <div className="space-y-3">
                  {[
                    { date: new Date(caseData.created_at).toLocaleDateString(), event: "Case Created", status: "completed" },
                    { date: "Pending", event: "Lawyer Review", status: caseData.status === "open" ? "current" : "completed" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === "completed" ? "bg-green-500" :
                        item.status === "current" ? "bg-primary animate-pulse" :
                        "bg-muted"
                      }`} />
                      <div className="flex-1 flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant={item.status === "completed" ? "outline" : "default"} className="capitalize">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interested Lawyers — Client Only */}
          {role === "client" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">⚖️ Lawyers Interested in Your Case</h2>
              {isLawyersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : interestedLawyers.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No lawyers have expressed interest yet. Sit tight — lawyers will reach out once they review your case.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {interestedLawyers.map((lawyer: any) => {
                    const specs = lawyer.specialization
                      ? lawyer.specialization.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 3)
                      : [];
                    return (
                      <Card key={lawyer.lawyer_id} className="hover:shadow-md transition-shadow hover:border-primary/40">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback className="text-xl">
                                {lawyer.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-lg leading-tight">{lawyer.full_name}</h3>
                                {lawyer.verified && (
                                  <Badge variant="default" className="gap-1 text-xs">
                                    <ShieldCheck className="h-3 w-3" />Verified
                                  </Badge>
                                )}
                                <Badge variant={lawyer.status === "accepted" ? "default" : "secondary"} className="text-xs capitalize">
                                  {lawyer.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {lawyer.average_rating.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {lawyer.experience_years} yrs exp
                                </span>
                                {lawyer.hourly_rate && (
                                  <span>₹{Number(lawyer.hourly_rate).toLocaleString("en-IN")}/hr</span>
                                )}
                              </div>
                              {specs.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {specs.map((spec: string) => (
                                    <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                                  ))}
                                </div>
                              )}
                              {lawyer.message && (
                                <p className="text-sm text-muted-foreground italic line-clamp-2 mb-3">"{lawyer.message}"</p>
                              )}
                              <Link to={`/lawyer/${lawyer.lawyer_id}`}>
                                <Button size="sm" className="gap-2 w-full">
                                  View Full Profile & Book
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Similar Cases */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📄 Similar Past Judgements</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCases.map((caseItem) => (
                <Card key={caseItem.id} className="hover-scale">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <span>{caseItem.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{caseItem.court}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{caseItem.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {caseItem.summary}
                    </p>
                    <Button variant="outline" className="w-full">
                      Read Full Summary
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetails;
