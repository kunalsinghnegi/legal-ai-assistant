import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Camera, Star, MapPin, Briefcase, GraduationCap, Award, Plus, X } from "lucide-react";

const ProfileSettings = () => {
  const [specializations, setSpecializations] = useState([
    "Criminal Law", "Property Law", "Civil Litigation"
  ]);
  const [languages, setLanguages] = useState(["English", "Hindi", "Marathi"]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">⚙️ Profile Settings</h1>
            <p className="text-muted-foreground">Manage your public profile and preferences</p>
          </div>

          {/* Profile Photo & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Profile Photo & Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Adv.RajeshKumar" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input defaultValue="Adv. Rajesh Kumar" />
                    </div>
                    <div>
                      <Label>Bar Council Registration No.</Label>
                      <Input defaultValue="MH/1234/2010" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input type="email" defaultValue="rajesh.kumar@legal.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input defaultValue="+91 98765 43210" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Years of Experience</Label>
                  <Input type="number" defaultValue="14" />
                </div>
                <div>
                  <Label>Consultation Fee (₹)</Label>
                  <Input type="number" defaultValue="2000" />
                </div>
              </div>
              
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  Office Address
                </Label>
                <Textarea defaultValue="Suite 401, Legal Chambers, Nariman Point, Mumbai - 400021" />
              </div>

              <div>
                <Label>Bio / About</Label>
                <Textarea 
                  className="min-h-[100px]"
                  defaultValue="Experienced criminal and property lawyer with over 14 years of practice in Maharashtra courts. Specializing in complex property disputes, criminal defense, and civil litigation. Former Additional Public Prosecutor with the Government of Maharashtra."
                />
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Specializations
              </CardTitle>
              <CardDescription>Add your areas of legal expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="px-3 py-1 text-sm">
                    {spec}
                    <button onClick={() => removeSpecialization(spec)} className="ml-2 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add specialization..." 
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSpecialization()}
                />
                <Button onClick={addSpecialization}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Education & Languages */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Law Degree</Label>
                  <Input defaultValue="LLB, Mumbai University (2008)" />
                </div>
                <div>
                  <Label>Additional Qualifications</Label>
                  <Input defaultValue="LLM in Criminal Law, NLU Delhi (2010)" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Languages you can consult in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="px-3 py-1">
                      {lang}
                      <button onClick={() => removeLanguage(lang)} className="ml-2 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add language..." 
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                  />
                  <Button variant="outline" onClick={addLanguage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Availability Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
              <CardDescription>Control how clients can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Accept New Clients</p>
                  <p className="text-sm text-muted-foreground">Allow new consultation requests</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Video Consultations</p>
                  <p className="text-sm text-muted-foreground">Offer video call consultations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat Consultations</p>
                  <p className="text-sm text-muted-foreground">Offer text-based consultations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">In-Person Meetings</p>
                  <p className="text-sm text-muted-foreground">Allow office visits</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
