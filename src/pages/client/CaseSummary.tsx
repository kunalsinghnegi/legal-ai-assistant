import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Calendar, User, Clock, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CaseSummary = () => {
  const cases = [
    {
      id: 1,
      title: "Property Dispute - Ancestral Land",
      caseNumber: "CASE-2024-001",
      type: "Property Law",
      status: "In Progress",
      progress: 60,
      filedDate: "Jan 10, 2025",
      nextHearing: "Feb 15, 2025",
      lawyer: "Adv. Rajesh Kumar",
      court: "Mumbai High Court",
      updates: [
        { date: "Jan 28, 2025", text: "Evidence submitted to court" },
        { date: "Jan 20, 2025", text: "Witness statement recorded" },
      ]
    },
    {
      id: 2,
      title: "Consumer Complaint - Defective Product",
      caseNumber: "CASE-2024-002",
      type: "Consumer Protection",
      status: "Pending Review",
      progress: 25,
      filedDate: "Jan 15, 2025",
      nextHearing: "Feb 20, 2025",
      lawyer: "Adv. Priya Sharma",
      court: "Consumer Forum, Delhi",
      updates: [
        { date: "Jan 25, 2025", text: "Case documents under review" },
      ]
    },
    {
      id: 3,
      title: "Insurance Claim Dispute",
      caseNumber: "CASE-2023-089",
      type: "Civil Law",
      status: "Resolved",
      progress: 100,
      filedDate: "Nov 05, 2023",
      nextHearing: "-",
      lawyer: "Adv. Amit Patel",
      court: "District Court, Ahmedabad",
      updates: [
        { date: "Dec 15, 2024", text: "Case resolved in favor of client" },
        { date: "Dec 10, 2024", text: "Final hearing completed" },
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "default";
      case "Pending Review": return "secondary";
      case "Resolved": return "outline";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress": return <Clock className="h-4 w-4" />;
      case "Pending Review": return <AlertCircle className="h-4 w-4" />;
      case "Resolved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="client" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📂 My Case Summary</h1>
            <p className="text-muted-foreground">Track and manage all your legal cases</p>
          </div>

          {/* Case Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">2</p>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">1</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">1</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cases List */}
          <div className="space-y-6">
            {cases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(caseItem.status)}
                        <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                        <Badge variant={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span>{caseItem.caseNumber}</span>
                        <span>•</span>
                        <span>{caseItem.type}</span>
                        <span>•</span>
                        <span>{caseItem.court}</span>
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
                      <span className="font-medium">{caseItem.progress}%</span>
                    </div>
                    <Progress value={caseItem.progress} className="h-2" />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Filed Date
                      </p>
                      <p className="font-medium">{caseItem.filedDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Next Hearing
                      </p>
                      <p className="font-medium">{caseItem.nextHearing}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <User className="h-4 w-4" /> Lawyer
                      </p>
                      <p className="font-medium">{caseItem.lawyer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{caseItem.type}</p>
                    </div>
                  </div>

                  {/* Recent Updates */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Recent Updates</p>
                    <div className="space-y-2">
                      {caseItem.updates.slice(0, 2).map((update, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground w-24">{update.date}</span>
                          <span>{update.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseSummary;
