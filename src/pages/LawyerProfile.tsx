import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, ArrowLeft, Star, MapPin, Briefcase, Calendar, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

type LawyerData = {
  user_id: string;
  full_name: string;
  bar_id: string;
  specialization: string;
  experience_years: number;
  hourly_rate: number | null;
  bio: string | null;
  verified: boolean;
  average_rating: number;
  total_reviews: number;
  address: string | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client_name: string;
};

const LawyerProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["lawyer_profile", id],
    queryFn: async () => {
      if (!id) return null;
      const [{ data: lawyerRow }, { data: profile }, { data: reviewRows }] = await Promise.all([
        supabase.from("lawyers").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("profiles").select("full_name, address").eq("user_id", id).maybeSingle(),
        supabase.from("reviews").select("*").eq("lawyer_id", id).order("created_at", { ascending: false }).limit(10),
      ]);

      let lawyerData: LawyerData | null = null;
      if (lawyerRow && profile) {
        lawyerData = {
          user_id: lawyerRow.user_id,
          full_name: profile.full_name,
          bar_id: lawyerRow.bar_id,
          specialization: lawyerRow.specialization,
          experience_years: lawyerRow.experience_years,
          hourly_rate: lawyerRow.hourly_rate,
          bio: lawyerRow.bio,
          verified: lawyerRow.verified,
          average_rating: Number(lawyerRow.average_rating ?? 0),
          total_reviews: lawyerRow.total_reviews ?? 0,
          address: profile.address,
        };
      }

      let reviewsData: Review[] = [];
      if (reviewRows && reviewRows.length > 0) {
        reviewsData = await Promise.all(
          reviewRows.map(async (r) => {
            const { data: cp } = await supabase.from("profiles").select("full_name").eq("user_id", r.client_id).maybeSingle();
            return {
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
              client_name: cp?.full_name ?? "Anonymous",
            };
          })
        );
      }

      return { lawyer: lawyerData, reviews: reviewsData };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!data?.lawyer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Lawyer not found</p>
        <Link to="/client-dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const { lawyer, reviews } = data;
  const specs = lawyer.specialization.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/client-dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
          <Link to="/" className="flex items-center gap-2"><Scale className="h-6 w-6 text-primary" /><span className="font-bold text-lg">LegalAI</span></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl">{lawyer.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h1 className="text-3xl font-bold">{lawyer.full_name}</h1>
                        {lawyer.verified && (
                          <Badge variant="default" className="gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {lawyer.average_rating.toFixed(1)} ({lawyer.total_reviews} reviews)
                        </span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{lawyer.experience_years} years experience</span>
                        {lawyer.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{lawyer.address}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/book-appointment/${lawyer.user_id}`}>
                        <Button className="gap-2"><Calendar className="h-4 w-4" />Book Appointment</Button>
                      </Link>
                      <Link to="/chat-ai">
                        <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" />Ask AI</Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">Bar ID</p>
                      <p className="text-muted-foreground">{lawyer.bar_id || "Not provided"}</p>
                    </div>
                    {specs.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Specialization</p>
                        <div className="flex flex-wrap gap-2">
                          {specs.map((spec) => <Badge key={spec} variant="secondary">{spec}</Badge>)}
                        </div>
                      </div>
                    )}
                    {lawyer.hourly_rate && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Consultation Fee</p>
                        <p className="text-muted-foreground">₹{Number(lawyer.hourly_rate).toLocaleString("en-IN")}/hr</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {lawyer.bio && (
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed whitespace-pre-line">{lawyer.bio}</p></CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />Ratings & Reviews ({lawyer.total_reviews})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.client_name}</h4>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LawyerProfile;
