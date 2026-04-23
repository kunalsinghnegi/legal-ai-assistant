import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Camera, Briefcase, Award, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Lawyer fields
  const [barId, setBarId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: lawyer }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("lawyers").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? "");
      }
      if (lawyer) {
        setBarId(lawyer.bar_id ?? "");
        setSpecialization(lawyer.specialization ?? "");
        setExperienceYears(String(lawyer.experience_years ?? ""));
        setHourlyRate(lawyer.hourly_rate ? String(lawyer.hourly_rate) : "");
        setBio(lawyer.bio ?? "");
        setVerified(!!lawyer.verified);
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const profileUpdate = supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address, bar_id: barId, specialization, experience_years: experienceYears ? Number(experienceYears) : null })
      .eq("user_id", user.id);

    const lawyerUpsert = supabase.from("lawyers").upsert(
      {
        user_id: user.id,
        bar_id: barId,
        specialization,
        experience_years: experienceYears ? Number(experienceYears) : 0,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        bio,
      },
      { onConflict: "user_id" }
    );

    const [p, l] = await Promise.all([profileUpdate, lawyerUpsert]);
    setSaving(false);

    if (p.error || l.error) {
      toast.error(p.error?.message ?? l.error?.message ?? "Save failed");
      return;
    }
    toast.success("Profile saved");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userType="lawyer" />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">⚙️ Profile Settings</h1>
              <p className="text-muted-foreground">Manage your public profile and credentials</p>
            </div>
            <Badge variant={verified ? "default" : "secondary"} className="gap-1 px-3 py-2">
              {verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              {verified ? "Verified by Admin" : "Pending Verification"}
            </Badge>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" />Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">{fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                  <div><Label>Bar Council Registration No.</Label><Input value={barId} onChange={(e) => setBarId(e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" value={user?.email ?? ""} disabled /></div>
                  <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Professional Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Years of Experience</Label><Input type="number" min={0} max={80} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} /></div>
                <div><Label>Consultation Fee (₹/hr)</Label><Input type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="2000" /></div>
              </div>
              <div><Label>Office Address</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div><Label>Bio / About</Label><Textarea className="min-h-[120px]" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about your practice, expertise, and approach..." /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Specialization</CardTitle></CardHeader>
            <CardContent>
              <Label>Areas of Practice (comma-separated)</Label>
              <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Criminal Law, Property Law, Family Law" className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Used to match you with relevant cases.</p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
