import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Calendar, User, Clock, ChevronRight, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CaseSummary = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCase, setNewCase] = useState({ title: "", description: "", category: "Property Law" });

  // Fetch Cases
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          id, 
          title, 
          description, 
          category, 
          status, 
          urgency,
          created_at,
          updated_at
        `)
        .eq("client_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Submit New Case
  const submitCaseMutation = useMutation({
    mutationFn: async (caseData: { title: string, description: string, category: string }) => {
      const { data, error } = await supabase.from("cases").insert({
        client_id: user?.id,
        title: caseData.title,
        description: caseData.description,
        category: caseData.category,
        status: "open",
        urgency: "medium",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", user?.id] });
      toast.success("Case submitted successfully");
      setIsDialogOpen(false);
      setNewCase({ title: "", description: "", category: "Property Law" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit case");
    }
  });

  const handleSubmitCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.title || !newCase.description) {
      toast.error("Please fill in all fields");
      return;
    }
    submitCaseMutation.mutate(newCase);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress": return "default";
      case "open": return "secondary";
      case "closed": return "outline";
      case "cancelled": return "destructive";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "open": return <AlertCircle className="h-4 w-4" />;
      case "closed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Process derived values for UI
  const formatStatus = (s: string) => s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="client" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">📂 My Case Summary</h1>
              <p className="text-muted-foreground">Track and manage all your legal cases</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Submit New Case
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit a New Case</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitCase} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Case Title</Label>
                    <Input 
                      id="title" 
                      placeholder="E.g., Property Dispute in Mumbai" 
                      value={newCase.title}
                      onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Case Category</Label>
                    <select 
                      id="category" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                      value={newCase.category}
                      onChange={(e) => setNewCase({...newCase, category: e.target.value})}
                    >
                      <option value="Property Law">Property Law</option>
                      <option value="Criminal Defense">Criminal Defense</option>
                      <option value="Civil Litigation">Civil Litigation</option>
                      <option value="Family Law">Family Law</option>
                      <option value="Corporate Law">Corporate Law</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe your situation..."
                      rows={4}
                      value={newCase.description}
                      onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitCaseMutation.isPending}>
                    {submitCaseMutation.isPending ? "Submitting..." : "Submit Case"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Case Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{cases.filter((c: any) => c.status === 'in_progress').length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">{cases.filter((c: any) => c.status === 'open').length}</p>
                  <p className="text-sm text-muted-foreground">Open / Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{cases.filter((c: any) => c.status === 'closed').length}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cases List */}
          <div className="space-y-6">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading cases...</p>
            ) : cases.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 border rounded-lg border-dashed">No cases found. Submit a new case to get started.</p>
            ) : (
              cases.map((caseItem: any) => {
                let progress = 10;
                if (caseItem.status === "in_progress") progress = 50;
                if (caseItem.status === "closed") progress = 100;

                return (
                  <Card 
                    key={caseItem.id} 
                    className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                    onClick={() => navigate(`/case/${caseItem.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(caseItem.status)}
                            <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                            <Badge variant={getStatusColor(caseItem.status)}>{formatStatus(caseItem.status)}</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="font-mono text-xs truncate max-w-[120px]">ID: {caseItem.id.split('-')[0]}</span>
                            <span>•</span>
                            <span>{caseItem.category}</span>
                            <span>•</span>
                            <span>{caseItem.urgency} Urgency</span>
                          </CardDescription>
                        </div>
                        <Link to={`/case/${caseItem.id}`}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Case Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Filed Date
                          </p>
                          <p className="font-medium">{new Date(caseItem.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Last Updated
                          </p>
                          <p className="font-medium">{new Date(caseItem.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{caseItem.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseSummary;
