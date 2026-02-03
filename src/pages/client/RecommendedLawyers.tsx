import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Star, Calendar, MapPin, Briefcase, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const RecommendedLawyers = () => {
  const lawyers = [
    { 
      id: 1, 
      name: "Adv. Rajesh Kumar", 
      specialization: "Criminal Law", 
      rating: 4.8, 
      cases: 150,
      experience: "14 years",
      location: "Mumbai",
      fee: "₹2,000/hr",
      languages: ["English", "Hindi", "Marathi"],
      available: true
    },
    { 
      id: 2, 
      name: "Adv. Priya Sharma", 
      specialization: "Civil Law", 
      rating: 4.9, 
      cases: 200,
      experience: "12 years",
      location: "Delhi",
      fee: "₹2,500/hr",
      languages: ["English", "Hindi"],
      available: true
    },
    { 
      id: 3, 
      name: "Adv. Amit Patel", 
      specialization: "Property Law", 
      rating: 4.7, 
      cases: 120,
      experience: "10 years",
      location: "Ahmedabad",
      fee: "₹1,800/hr",
      languages: ["English", "Hindi", "Gujarati"],
      available: false
    },
    { 
      id: 4, 
      name: "Adv. Sunita Reddy", 
      specialization: "Family Law", 
      rating: 4.9, 
      cases: 180,
      experience: "15 years",
      location: "Bangalore",
      fee: "₹2,200/hr",
      languages: ["English", "Hindi", "Kannada", "Telugu"],
      available: true
    },
    { 
      id: 5, 
      name: "Adv. Mohammed Khan", 
      specialization: "Corporate Law", 
      rating: 4.6, 
      cases: 90,
      experience: "8 years",
      location: "Hyderabad",
      fee: "₹3,000/hr",
      languages: ["English", "Hindi", "Urdu"],
      available: true
    },
    { 
      id: 6, 
      name: "Adv. Lakshmi Iyer", 
      specialization: "Tax Law", 
      rating: 4.8, 
      cases: 110,
      experience: "11 years",
      location: "Chennai",
      fee: "₹2,800/hr",
      languages: ["English", "Hindi", "Tamil"],
      available: true
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="client" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧑‍⚖️ Recommended Lawyers</h1>
            <p className="text-muted-foreground">Top-rated lawyers matching your case requirements</p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, specialization, or location..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Specialization Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">All</Badge>
            <Badge variant="outline">Criminal Law</Badge>
            <Badge variant="outline">Civil Law</Badge>
            <Badge variant="outline">Property Law</Badge>
            <Badge variant="outline">Family Law</Badge>
            <Badge variant="outline">Corporate Law</Badge>
            <Badge variant="outline">Tax Law</Badge>
          </div>

          {/* Lawyers Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {lawyers.map((lawyer) => (
              <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lawyer.name}`} />
                      <AvatarFallback>{lawyer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                        {lawyer.available ? (
                          <Badge className="bg-green-500">Available</Badge>
                        ) : (
                          <Badge variant="secondary">Busy</Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4" />
                        {lawyer.specialization}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{lawyer.rating}</span>
                      <span className="text-muted-foreground">({lawyer.cases} cases)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {lawyer.experience} experience
                    </div>
                    <div className="font-semibold text-primary">
                      {lawyer.fee}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {lawyer.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link to={`/lawyer/${lawyer.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                    <Link to={`/book-appointment/${lawyer.id}`}>
                      <Button className="flex items-center gap-1" disabled={!lawyer.available}>
                        <Calendar className="h-4 w-4" />
                        Book
                      </Button>
                    </Link>
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

export default RecommendedLawyers;
