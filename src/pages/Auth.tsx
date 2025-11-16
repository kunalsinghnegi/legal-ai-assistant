import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, User } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

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
          <CardDescription className="text-center">
            Choose your account type to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="gap-2">
                <User className="h-4 w-4" />
                Client
              </TabsTrigger>
              <TabsTrigger value="lawyer" className="gap-2">
                <Scale className="h-4 w-4" />
                Lawyer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="space-y-4">
              {isLogin ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email / Phone</Label>
                    <Input id="client-email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Password</Label>
                    <Input id="client-password" type="password" placeholder="••••••••" />
                  </div>
                  <Button className="w-full">Login as Client</Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Full Name</Label>
                    <Input id="client-name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email-signup">Email</Label>
                    <Input id="client-email-signup" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Contact Number</Label>
                    <Input id="client-phone" placeholder="+1 234 567 8900" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-address">Address</Label>
                    <Input id="client-address" placeholder="Your address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-category">Case Category</Label>
                    <Input id="client-category" placeholder="e.g., Criminal, Civil" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password-signup">Password</Label>
                    <Input id="client-password-signup" type="password" placeholder="••••••••" />
                  </div>
                  <Button className="w-full">Create Client Account</Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="lawyer" className="space-y-4">
              {isLogin ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-email">Email / Phone</Label>
                    <Input id="lawyer-email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-password">Password</Label>
                    <Input id="lawyer-password" type="password" placeholder="••••••••" />
                  </div>
                  <Button className="w-full">Login as Lawyer</Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-name">Full Name</Label>
                    <Input id="lawyer-name" placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-email-signup">Email</Label>
                    <Input id="lawyer-email-signup" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-bar">Bar ID</Label>
                    <Input id="lawyer-bar" placeholder="BAR123456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-experience">Experience (Years)</Label>
                    <Input id="lawyer-experience" type="number" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-specialization">Specialization</Label>
                    <Input id="lawyer-specialization" placeholder="Criminal Law, Civil Law" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lawyer-password-signup">Password</Label>
                    <Input id="lawyer-password-signup" type="password" placeholder="••••••••" />
                  </div>
                  <Button className="w-full">Create Lawyer Account</Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
