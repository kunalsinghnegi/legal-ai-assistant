import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Clock, TrendingUp } from "lucide-react";

const RecommendedCases = () => {
  const recommendedCases = [
    {
      id: 1,
      title: "Property Inheritance Dispute",
      caseType: "Property Law",
      location: "Mumbai, Maharashtra",
      budget: "₹50,000 - ₹1,00,000",
      matchScore: 98,
      postedAgo: "2 hours ago",
      description: "Dispute between siblings over inherited ancestral property. Need experienced property lawyer for mediation and court proceedings.",
      skills: ["Property Law", "Inheritance", "Mediation"]
    },
    {
      id: 2,
      title: "Corporate Fraud Investigation",
      caseType: "Criminal Law",
      location: "Delhi NCR",
      budget: "₹2,00,000+",
      matchScore: 95,
      postedAgo: "5 hours ago",
      description: "Large-scale corporate fraud case requiring criminal defense expertise. Multiple accused involved.",
      skills: ["Criminal Defense", "White Collar Crime", "Corporate Law"]
    },
    {
      id: 3,
      title: "Land Acquisition Compensation",
      caseType: "Property Law",
      location: "Pune, Maharashtra",
      budget: "₹75,000 - ₹1,50,000",
      matchScore: 92,
      postedAgo: "1 day ago",
      description: "Government land acquisition case. Client seeking fair compensation and challenging undervaluation.",
      skills: ["Property Law", "Land Acquisition", "Government Cases"]
    },
    {
      id: 4,
      title: "Cheque Bounce Case",
      caseType: "Criminal Law",
      location: "Bangalore, Karnataka",
      budget: "₹25,000 - ₹50,000",
      matchScore: 88,
      postedAgo: "2 days ago",
      description: "NI Act Section 138 case. Multiple cheques bounced, total amount ₹15 lakhs.",
      skills: ["Criminal Law", "NI Act", "Banking Law"]
    },
    {
      id: 5,
      title: "Partnership Dissolution",
      caseType: "Civil Law",
      location: "Chennai, Tamil Nadu",
      budget: "₹1,00,000 - ₹2,00,000",
      matchScore: 85,
      postedAgo: "3 days ago",
      description: "Partnership firm dissolution with asset division dispute. Three partners involved.",
      skills: ["Civil Law", "Partnership Law", "Commercial Disputes"]
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📁 Recommended Cases</h1>
            <p className="text-muted-foreground">Cases matching your expertise and experience</p>
          </div>

          <div className="grid gap-6">
            {recommendedCases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {caseItem.matchScore}% Match
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {caseItem.caseType}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {caseItem.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {caseItem.postedAgo}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{caseItem.budget}</p>
                      <p className="text-xs text-muted-foreground">Estimated Budget</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{caseItem.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {caseItem.skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">View Details</Button>
                      <Button>Express Interest</Button>
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

export default RecommendedCases;
