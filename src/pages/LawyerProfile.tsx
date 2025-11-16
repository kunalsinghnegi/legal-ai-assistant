import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scale, ArrowLeft, Star, MapPin, Briefcase, GraduationCap, Award, Calendar, MessageSquare, Phone } from "lucide-react";

const LawyerProfile = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/client-dashboard" className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
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
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=lawyer${id}`} />
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Adv. Rajesh Kumar</h1>
                      <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          4.8 Rating
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          15 Years Experience
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Delhi, India
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/book-appointment/${id}`}>
                        <Button className="gap-2">
                          <Calendar className="h-4 w-4" />
                          Book Appointment
                        </Button>
                      </Link>
                      <Link to="/chat-ai">
                        <Button variant="outline" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">Bar ID</p>
                      <p className="text-muted-foreground">D/1234/2010</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Specialization</p>
                      <div className="flex flex-wrap gap-2">
                        {["Criminal Law", "Property Law", "Civil Litigation"].map((spec) => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Cases Won", value: "150+", icon: Award },
              { label: "Success Rate", value: "87%", icon: Star },
              { label: "Clients Served", value: "200+", icon: Briefcase },
              { label: "Years Practice", value: "15", icon: GraduationCap }
            ].map((stat) => (
              <Card key={stat.label} className="hover-scale">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Adv. Rajesh Kumar is a distinguished advocate with over 15 years of experience in 
                Criminal Law, Property Law, and Civil Litigation. He has successfully represented 
                clients in various high-profile cases and is known for his meticulous attention to 
                detail and strategic approach to legal matters.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With a strong track record of winning complex cases, he specializes in property 
                disputes, criminal defense, and civil matters. His commitment to justice and client 
                satisfaction has earned him a stellar reputation in the legal community.
              </p>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { degree: "LLM (Master of Laws)", institution: "Delhi University", year: "2010" },
                { degree: "LLB (Bachelor of Laws)", institution: "National Law University", year: "2008" },
                { degree: "BA (Political Science)", institution: "St. Stephen's College", year: "2005" }
              ].map((edu, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                  <GraduationCap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Bar Council of Delhi - Excellence in Legal Practice Award (2023)",
                  "Successfully defended 50+ criminal cases with acquittal",
                  "Landmark victory in property dispute case - Delhi High Court (2022)",
                  "Featured speaker at National Law Conference on Criminal Reforms"
                ].map((achievement, i) => (
                  <li key={i} className="flex gap-3">
                    <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Case History */}
          <Card>
            <CardHeader>
              <CardTitle>Notable Case History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Property Dispute - Delhi High Court", outcome: "Won", year: "2024" },
                  { title: "Criminal Defense - Sessions Court", outcome: "Acquittal", year: "2023" },
                  { title: "Civil Litigation - District Court", outcome: "Settled", year: "2023" }
                ].map((caseItem, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <h4 className="font-semibold">{caseItem.title}</h4>
                      <p className="text-sm text-muted-foreground">{caseItem.year}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {caseItem.outcome}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                Ratings & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Kunal Sharma", rating: 5, comment: "Excellent lawyer! Very professional and won my case.", date: "2 weeks ago" },
                { name: "Priya Patel", rating: 5, comment: "Highly recommended. Very knowledgeable and supportive.", date: "1 month ago" },
                { name: "Amit Kumar", rating: 4, comment: "Good experience. Helped me understand the legal process clearly.", date: "2 months ago" }
              ].map((review, i) => (
                <div key={i} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to get legal help?</h3>
                  <p className="opacity-90">Book a consultation with Adv. Rajesh Kumar today</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/book-appointment/${id}`}>
                    <Button size="lg" variant="secondary">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LawyerProfile;
