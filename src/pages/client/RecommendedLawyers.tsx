import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Star, Calendar, MapPin, Briefcase, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const RecommendedLawyers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Fetch client profile to get preferred case category (optional enhancement)
  const { data: clientProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch lawyers and their profiles
  const { data: lawyers = [], isLoading } = useQuery({
    queryKey: ["lawyers"],
    queryFn: async () => {
      // Fetch all lawyers
      const { data: lawyersData, error: lawyersError } = await supabase.from("lawyers").select("*");
      if (lawyersError) throw lawyersError;

      if (!lawyersData || lawyersData.length === 0) return [];

      const userIds = lawyersData.map(l => l.user_id);

      // Fetch corresponding profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
      
      if (profilesError) throw profilesError;

      // Merge data
      return lawyersData.map(lawyer => {
        const profile = profilesData?.find(p => p.user_id === lawyer.user_id);
        return {
          ...lawyer,
          profile
        };
      });
    }
  });

  const filters = ["All", "Criminal Defense", "Civil Litigation", "Property Law", "Family Law", "Corporate Law", "Tax Law"];

  const filteredLawyers = lawyers.filter((lawyer: any) => {
    const matchesSearch = lawyer.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lawyer.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All" || lawyer.specialization === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
              <Input 
                placeholder="Search by name, specialization, or location..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Specialization Tags */}
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <Badge 
                key={filter} 
                variant={selectedFilter === filter ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>

          {/* Lawyers Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {isLoading ? (
              <p className="text-muted-foreground text-center col-span-2 py-8">Loading lawyers...</p>
            ) : filteredLawyers.length === 0 ? (
              <p className="text-muted-foreground text-center col-span-2 py-8">No lawyers found matching your criteria.</p>
            ) : (
              filteredLawyers.map((lawyer: any) => {
                const name = lawyer.profile?.full_name || "Advocate";
                return (
                  <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                          <AvatarFallback>{name.split(" ").map((n: string) => n[0]).join("").substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{name}</CardTitle>
                            {/* Assuming all are available for now, could be added to DB schema later */}
                            <Badge className="bg-green-500">Available</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Briefcase className="h-4 w-4" />
                            {lawyer.specialization || "General Practice"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{lawyer.average_rating || 0}</span>
                          <span className="text-muted-foreground">({lawyer.total_reviews || 0} cases)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{lawyer.profile?.address || "Location not specified"}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {lawyer.experience_years || 0} years experience
                        </div>
                        <div className="font-semibold text-primary">
                          {lawyer.hourly_rate ? `₹${lawyer.hourly_rate}/hr` : "Consult fee not set"}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link to={`/lawyer/${lawyer.user_id}`} className="flex-1">
                          <Button variant="outline" className="w-full">View Profile</Button>
                        </Link>
                        <Link to={`/book-appointment/${lawyer.user_id}`}>
                          <Button className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Book
                          </Button>
                        </Link>
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

export default RecommendedLawyers;
