import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, User } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Role = "client" | "lawyer";

const baseSchema = {
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
};

const clientSignupSchema = z.object({
  ...baseSchema,
  fullName: z.string().trim().min(1, "Name required").max(100),
  phone: z.string().trim().min(5, "Phone required").max(20),
  address: z.string().trim().min(1, "Address required").max(255),
  caseCategory: z.string().trim().min(1, "Case category required").max(100),
});

const lawyerSignupSchema = z.object({
  ...baseSchema,
  fullName: z.string().trim().min(1, "Name required").max(100),
  barId: z.string().trim().min(1, "Bar ID required").max(50),
  experienceYears: z.coerce.number().int().min(0).max(80),
  specialization: z.string().trim().min(1, "Specialization required").max(150),
});

const loginSchema = z.object(baseSchema);

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  // Client
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [caseCategory, setCaseCategory] = useState("");
  // Lawyer
  const [barId, setBarId] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const reset = () => {
    setEmail(""); setPassword(""); setFullName("");
    setPhone(""); setAddress(""); setCaseCategory("");
    setBarId(""); setExperienceYears(""); setSpecialization("");
  };

  const handleSubmit = async (selectedRole: Role) => {
    setSubmitting(true);
    try {
      if (isLogin) {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        toast.success("Signed in");
        return;
      }

      const metadata: Record<string, string> = { role: selectedRole, full_name: fullName };

      if (selectedRole === "client") {
        const parsed = clientSignupSchema.safeParse({ email, password, fullName, phone, address, caseCategory });
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
        Object.assign(metadata, {
          phone: parsed.data.phone,
          address: parsed.data.address,
          case_category: parsed.data.caseCategory,
        });
      } else {
        const parsed = lawyerSignupSchema.safeParse({ email, password, fullName, barId, experienceYears, specialization });
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
        Object.assign(metadata, {
          bar_id: parsed.data.barId,
          experience_years: String(parsed.data.experienceYears),
          specialization: parsed.data.specialization,
        });
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });
      if (error) throw error;
      toast.success("Check your email to verify your account");
      reset();
      setIsLogin(true);
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
          <Input id={`${selectedRole}-name`} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" maxLength={100} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${selectedRole}-email`}>Email</Label>
        <Input id={`${selectedRole}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={255} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${selectedRole}-password`}>Password</Label>
        <Input id={`${selectedRole}-password`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" maxLength={72} />
      </div>

      {!isLogin && selectedRole === "client" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="client-phone">Contact Number</Label>
            <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-address">Address</Label>
            <Input id="client-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-category">Case Category</Label>
            <Input id="client-category" value={caseCategory} onChange={(e) => setCaseCategory(e.target.value)} placeholder="e.g., Criminal, Civil" maxLength={100} />
          </div>
        </>
      )}

      {!isLogin && selectedRole === "lawyer" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="lawyer-bar">Bar ID</Label>
            <Input id="lawyer-bar" value={barId} onChange={(e) => setBarId(e.target.value)} placeholder="BAR123456" maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lawyer-experience">Experience (Years)</Label>
            <Input id="lawyer-experience" type="number" min={0} max={80} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lawyer-specialization">Specialization</Label>
            <Input id="lawyer-specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Criminal Law, Civil Law" maxLength={150} />
          </div>
        </>
      )}

      <Button className="w-full" disabled={submitting} onClick={() => handleSubmit(selectedRole)}>
        {submitting ? "Please wait..." : isLogin ? `Login as ${selectedRole === "lawyer" ? "Lawyer" : "Client"}` : `Create ${selectedRole === "lawyer" ? "Lawyer" : "Client"} Account`}
      </Button>

      {isLogin && (
        <div className="text-center">
          <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
      )}

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

      <Card className="w-full max-w-md animate-fade-in my-8">
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
