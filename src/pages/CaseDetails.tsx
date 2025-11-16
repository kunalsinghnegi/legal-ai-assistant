import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowLeft, Download, FileText, Calendar, MapPin } from "lucide-react";

const CaseDetails = () => {
  const similarCases = [
    {
      id: 1,
      title: "Ram Kumar vs State of Delhi",
      court: "Delhi High Court",
      date: "March 15, 2023",
      summary: "Property dispute regarding ancestral land ownership rights and documentation."
    },
    {
      id: 2,
      title: "Sharma Properties Ltd vs Municipal Corp",
      court: "Supreme Court of India",
      date: "January 8, 2024",
      summary: "Landmark case on property tax assessment and municipal jurisdiction."
    },
    {
      id: 3,
      title: "Patel v. Patel Family Trust",
      court: "Mumbai High Court",
      date: "November 22, 2023",
      summary: "Family property division and inheritance rights determination."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/client-dashboard" className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">LegalAI</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Case Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Property Dispute Case</CardTitle>
                  <CardDescription className="text-base">Case ID: #PD-2025-001</CardDescription>
                </div>
                <Badge className="text-sm px-4 py-1">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Filed On</p>
                    <p className="font-medium">January 10, 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">Property Law</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Court</p>
                    <p className="font-medium">District Court, Delhi</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Case Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This case involves a property ownership dispute between two parties regarding 
                  ancestral land in South Delhi. The plaintiff claims rightful ownership based on 
                  inheritance documents, while the defendant contests the validity of these documents. 
                  The case is currently in the evidence submission phase.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Uploaded Documents</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {["Property Deed", "Inheritance Certificate", "Survey Report"].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">{doc}.pdf</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Case Timeline</h3>
                <div className="space-y-3">
                  {[
                    { date: "Jan 10, 2025", event: "Case Filed", status: "completed" },
                    { date: "Jan 15, 2025", event: "Documents Submitted", status: "completed" },
                    { date: "Jan 25, 2025", event: "First Hearing", status: "completed" },
                    { date: "Feb 5, 2025", event: "Evidence Review", status: "current" },
                    { date: "Feb 20, 2025", event: "Next Hearing", status: "upcoming" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === "completed" ? "bg-green-500" :
                        item.status === "current" ? "bg-primary animate-pulse" :
                        "bg-muted"
                      }`} />
                      <div className="flex-1 flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant={item.status === "completed" ? "outline" : "default"}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Cases */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📄 Similar Past Judgements</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCases.map((caseItem) => (
                <Card key={caseItem.id} className="hover-scale">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <span>{caseItem.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{caseItem.court}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{caseItem.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {caseItem.summary}
                    </p>
                    <Button variant="outline" className="w-full">
                      Read Full Summary
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetails;
