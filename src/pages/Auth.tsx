import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Role = "client" | "lawyer";

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (selectedRole: Role) => {
    if (!email || !password || (!isLogin && !fullName)) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, role: selectedRole },
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account");
        reset();
        setIsLogin(true);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
    } catch (e: any) {
      toast.error(e.message ?? "Google sign-in failed");
      setSubmitting(false);
    }
  };

  const renderForm = (selectedRole: Role) => (
    <div className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor={`${selectedRole}-name`}>Full Name</Label>
          <Input id={`${selectedRole}-name`} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${selectedRole}-email`}>Email</Label>
        <Input id={`${selectedRole}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${selectedRole}-password`}>Password</Label>
        <Input id={`${selectedRole}-password`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button className="w-full" disabled={submitting} onClick={() => handleSubmit(selectedRole)}>
        {submitting ? "Please wait..." : isLogin ? `Login as ${selectedRole === "lawyer" ? "Lawyer" : "Client"}` : `Create ${selectedRole === "lawyer" ? "Lawyer" : "Client"} Account`}
      </Button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={handleGoogle}>
        Continue with Google
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="ghost">← Back to Home</Button>
      </Link>

      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">Choose your account type to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="client" className="w-full" onValueChange={reset}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="gap-2"><User className="h-4 w-4" />Client</TabsTrigger>
              <TabsTrigger value="lawyer" className="gap-2"><Scale className="h-4 w-4" />Lawyer</TabsTrigger>
            </TabsList>
            <TabsContent value="client">{renderForm("client")}</TabsContent>
            <TabsContent value="lawyer">{renderForm("lawyer")}</TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button onClick={() => { setIsLogin(!isLogin); reset(); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
