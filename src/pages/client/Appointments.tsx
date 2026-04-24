import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Phone, MessageSquare, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Appointments = () => {
  const { user } = useAuth();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch appointments and related cases
      const { data: aptData, error: aptError } = await supabase
        .from("appointments")
        .select(`
          *,
          cases (title)
        `)
        .eq("client_id", user.id)
        .order("scheduled_at", { ascending: false });

      if (aptError) throw aptError;
      if (!aptData || aptData.length === 0) return [];

      // Extract unique lawyer IDs
      const lawyerIds = Array.from(new Set(aptData.map(a => a.lawyer_id)));

      // Fetch lawyer profiles and specialties
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", lawyerIds);
        
      if (profilesError) throw profilesError;

      const { data: lawyersData } = await supabase
        .from("lawyers")
        .select("user_id, specialization")
        .in("user_id", lawyerIds);

      // Merge data
      return aptData.map((apt: any) => {
        const lawyerProfile = profilesData?.find(p => p.user_id === apt.lawyer_id);
        const lawyerData = lawyersData?.find(l => l.user_id === apt.lawyer_id);
        return {
          ...apt,
          lawyerName: lawyerProfile?.full_name || "Advocate",
          specialization: lawyerData?.specialization || "General Practice"
        };
      });
    },
    enabled: !!user?.id,
  });

  const now = new Date();
  
  const upcomingAppointments = appointments.filter((a: any) => new Date(a.scheduled_at) > now && a.status !== 'cancelled');
  const pastAppointments = appointments.filter((a: any) => new Date(a.scheduled_at) <= now || a.status === 'cancelled');

  const getModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "online": return <Video className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      case "chat": return <MessageSquare className="h-4 w-4" />;
      case "in_person": return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "completed": return <Badge variant="outline">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: any, isPast?: boolean }) => {
    const scheduledAt = new Date(appointment.scheduled_at);
    
    return (
      <Card className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.lawyerName}`} />
                <AvatarFallback>{appointment.lawyerName.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{appointment.lawyerName}</h3>
                <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                <p className="text-sm text-primary mt-1">{appointment.cases?.title || "General Consultation"}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {scheduledAt.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    {getModeIcon(appointment.mode)}
                    {appointment.mode?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(appointment.status)}
              {!isPast && appointment.status === "confirmed" && (
                <div className="flex gap-2 mt-2">
                  {appointment.mode === "video" && (
                    <Button size="sm">
                      <Video className="h-4 w-4 mr-1" /> Join
                    </Button>
                  )}
                  <Button variant="outline" size="sm">Reschedule</Button>
                </div>
              )}
              {isPast && (
                <Link to={`/book-appointment/${appointment.lawyer_id}`}>
                  <Button variant="outline" size="sm">Book Again</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="client" />
      
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📅 My Appointments</h1>
              <p className="text-muted-foreground">Manage your scheduled consultations</p>
            </div>
            <Link to="/client/recommended-lawyers">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading appointments...</p>
          ) : (
            <>
              {/* Upcoming Appointments */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Appointments ({upcomingAppointments.length})
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-muted-foreground border border-dashed rounded-lg p-6 text-center">No upcoming appointments.</p>
                  ) : (
                    upcomingAppointments.map((appointment: any) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))
                  )}
                </div>
              </div>

              {/* Past Appointments */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 mt-8">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Past Appointments ({pastAppointments.length})
                </h2>
                <div className="space-y-4">
                  {pastAppointments.length === 0 ? (
                    <p className="text-muted-foreground border border-dashed rounded-lg p-6 text-center">No past appointments.</p>
                  ) : (
                    pastAppointments.map((appointment: any) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} isPast />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Appointments;
