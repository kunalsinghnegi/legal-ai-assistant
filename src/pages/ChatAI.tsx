import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Scale,
  ArrowLeft,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  MapPin,
  Mail,
  Tag,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimilarCase {
  case_number: string;
  similarity: number;
  tags: string;
  solution_summary: string;
}

interface RecommendedLawyer {
  name: string;
  area: string;
  city: string;
  email: string;
}

interface RecommendResult {
  message: string;
  cases: SimilarCase[];
  tags: string[];
  lawyers: RecommendedLawyer[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CaseCard = ({ c, index }: { c: SimilarCase; index: number }) => {
  const [open, setOpen] = useState(false);
  const pct = Math.round(c.similarity * 100);

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            {index}. {c.case_number}
          </CardTitle>
          {/* Similarity badge */}
          <span
            className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
              pct >= 80
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : pct >= 60
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {pct}% match
          </span>
        </div>

        {/* Tags inline */}
        {c.tags && (
          <div className="flex flex-wrap gap-1 mt-1">
            {c.tags
              .split(",")
              .slice(0, 4)
              .map((t, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {t.trim()}
                </Badge>
              ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Expandable summary */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
        >
          {open ? (
            <>
              <ChevronUp className="h-3 w-3" /> Hide summary
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> View solution summary
            </>
          )}
        </button>

        {open && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed border-t border-border pt-2">
            {c.solution_summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const LawyerCard = ({ lawyer }: { lawyer: RecommendedLawyer }) => (
  <Card className="border border-border hover:border-primary/40 hover:shadow-md transition-all group">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <span className="text-primary font-bold text-sm">
            {lawyer.name.charAt(0)}
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {lawyer.name}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {lawyer.area}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {lawyer.city}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-primary/80 mt-0.5">
            <Mail className="h-3 w-3" />
            {lawyer.email}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ChatAI = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSearch = async () => {
    const text = query.trim();
    if (!text) {
      toast.warning("Please describe your legal scenario first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!resp.ok) {
        toast.error(
          resp.status === 500
            ? "ML backend error. Make sure the Python server is running."
            : `Request failed (${resp.status})`
        );
        return;
      }

      const data: RecommendResult = await resp.json();
      setResult(data);

      // Scroll to results
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch {
      toast.error(
        "Cannot connect to the ML backend. Run: uvicorn backend:app --reload inside the /send folder."
      );
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "My landlord refuses to return my security deposit after I vacated the property.",
    "My employer terminated me without notice and hasn't paid my last salary.",
    "I was injured in a road accident caused by a reckless driver.",
    "My business partner withdrew company funds without my consent.",
    "A neighbour is encroaching on my property boundary.",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Case &amp; Lawyer Recommender</span>
          </div>

          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
          </Link>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">

        {/* Hero / Input Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ⚖️ Legal Case &amp; Lawyer Recommendation
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Describe your legal situation and our ML model will find the most
            similar past cases and recommend the best-suited lawyers for you.
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              📝 Describe your legal scenario
            </label>
            <Textarea
              id="legalQuery"
              rows={5}
              placeholder="E.g. My landlord has not returned my security deposit even though I vacated the property three months ago and the apartment was in perfect condition..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="resize-none text-sm mb-4"
              disabled={loading}
            />

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                id="findCasesBtn"
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Analyzing…" : "Find Similar Cases & Lawyers"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQuery(""); setResult(null); }}
                disabled={loading}
                className="text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Example prompts */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(p)}
                  className="text-xs bg-muted hover:bg-secondary text-foreground px-3 py-1.5 rounded-full border border-border transition-colors text-left"
                >
                  {p.length > 60 ? p.slice(0, 60) + "…" : p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div ref={resultRef} className="space-y-8">

            {/* Tags */}
            {result.tags.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                  <Tag className="h-5 w-5 text-primary" />
                  Extracted Legal Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Cases + Lawyers side-by-side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Similar Cases — takes 2/3 */}
              <section className="lg:col-span-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  Top Similar Legal Cases
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {result.cases.length} results
                  </span>
                </h2>

                {result.cases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No similar cases found.</p>
                ) : (
                  <div className="space-y-3">
                    {result.cases.map((c, i) => (
                      <CaseCard key={i} c={c} index={i + 1} />
                    ))}
                  </div>
                )}
              </section>

              {/* Recommended Lawyers — takes 1/3 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  Recommended Lawyers
                </h2>

                {result.lawyers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lawyers found.</p>
                ) : (
                  <div className="space-y-3">
                    {result.lawyers.map((l, i) => (
                      <LawyerCard key={i} lawyer={l} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground text-center pb-4">
              ✅ Results powered by ML Case → Tags → Lawyer pipeline. This is for guidance only, not legal advice.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatAI;
