import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Role = "client" | "lawyer";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "pick-role" | "done">("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Exchange the code/token in the URL for a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        toast.error("Authentication failed. Please try again.");
        navigate("/auth", { replace: true });
        return;
      }

      const user = session.user;
      setUserId(user.id);

      // Check if user already has a role
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleRow?.role) {
        // Existing user — redirect to the right dashboard
        const dest = roleRow.role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard";
        navigate(dest, { replace: true });
      } else {
        // New Google user — ask them to pick a role
        setStatus("pick-role");
      }
    };

    handleCallback();
  }, [navigate]);

  const assignRole = async (role: Role) => {
    if (!userId) return;
    setSaving(true);
    try {
      // Delete any trigger-created default role, then insert the chosen one
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleError) throw roleError;

      // Create the profile entry if it doesn't exist
      const { data: { session } } = await supabase.auth.getSession();
      const fullName = session?.user?.user_metadata?.full_name ?? session?.user?.email ?? "";

      await supabase
        .from("profiles")
        .upsert(
          { user_id: userId, full_name: fullName },
          { onConflict: "user_id" }
        );

      // If lawyer, create a skeleton lawyers row so profile settings work
      if (role === "lawyer") {
        await supabase
          .from("lawyers")
          .upsert(
            {
              user_id: userId,
              bar_id: "PENDING",
              specialization: "General",
              experience_years: 0,
            },
            { onConflict: "user_id" }
          );
      }

      toast.success("Welcome! Your account is ready.");
      navigate(role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard", { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to set role. Please try again.");
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Scale className="h-12 w-12 text-primary animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Completing sign-in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Almost there!</CardTitle>
          <CardDescription>
            How are you joining <strong>LegalAI</strong>? Choose your role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            id="role-client"
            className="w-full h-16 text-lg gap-3"
            disabled={saving}
            onClick={() => assignRole("client")}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "👤"}
            I'm a Client — I need legal help
          </Button>
          <Button
            id="role-lawyer"
            variant="outline"
            className="w-full h-16 text-lg gap-3"
            disabled={saving}
            onClick={() => assignRole("lawyer")}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "⚖️"}
            I'm a Lawyer — I provide legal services
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
