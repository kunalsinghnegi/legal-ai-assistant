import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, FileText, Phone, Video, MessageSquare } from "lucide-react";

const ClientRequests = () => {
  const clientRequests = [
    { 
      id: 1, 
      name: "Kunal Sharma", 
      caseType: "Property Dispute", 
      date: "2 hours ago", 
      status: "new",
      description: "Need legal advice regarding a property inheritance dispute with siblings.",
      preferredMode: "video"
    },
    { 
      id: 2, 
      name: "Priya Patel", 
      caseType: "Divorce Case", 
      date: "5 hours ago", 
      status: "pending",
      description: "Seeking consultation for mutual divorce proceedings and asset division.",
      preferredMode: "call"
    },
    { 
      id: 3, 
      name: "Amit Kumar", 
      caseType: "Criminal Defense", 
      date: "1 day ago", 
      status: "reviewed",
      description: "Require urgent legal representation for a false accusation case.",
      preferredMode: "in-person"
    },
    { 
      id: 4, 
      name: "Sneha Reddy", 
      caseType: "Corporate Law", 
      date: "2 days ago", 
      status: "new",
      description: "Need help with company registration and compliance matters.",
      preferredMode: "chat"
    },
    { 
      id: 5, 
      name: "Rahul Mehta", 
      caseType: "Consumer Protection", 
      date: "3 days ago", 
      status: "pending",
      description: "Filing complaint against a fraudulent online seller.",
      preferredMode: "video"
    },
  ];

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "video": return <Video className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      case "chat": return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧾 Client Consultation Requests</h1>
            <p className="text-muted-foreground">Review and respond to new client inquiries</p>
          </div>

          <div className="flex gap-4 mb-6">
            <Badge variant="default" className="px-4 py-2">All ({clientRequests.length})</Badge>
            <Badge variant="outline" className="px-4 py-2">New ({clientRequests.filter(r => r.status === "new").length})</Badge>
            <Badge variant="outline" className="px-4 py-2">Pending ({clientRequests.filter(r => r.status === "pending").length})</Badge>
            <Badge variant="outline" className="px-4 py-2">Reviewed ({clientRequests.filter(r => r.status === "reviewed").length})</Badge>
          </div>

          <div className="space-y-4">
            {clientRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name}`} />
                        <AvatarFallback>{request.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{request.name}</h3>
                          <Badge variant={request.status === "new" ? "default" : request.status === "pending" ? "secondary" : "outline"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-primary font-medium">{request.caseType}</p>
                        <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {request.date}
                          </span>
                          <span className="flex items-center gap-1">
                            {getModeIcon(request.preferredMode)}
                            Prefers {request.preferredMode}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Accept</Button>
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

export default ClientRequests;
