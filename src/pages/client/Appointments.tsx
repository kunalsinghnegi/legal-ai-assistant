import DashboardSidebar from "@/components/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Phone, MessageSquare, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Appointments = () => {
  const upcomingAppointments = [
    {
      id: 1,
      lawyer: "Adv. Rajesh Kumar",
      specialization: "Criminal Law",
      date: "Feb 5, 2025",
      time: "10:00 AM",
      mode: "video",
      status: "confirmed",
      caseTitle: "Property Dispute Case"
    },
    {
      id: 2,
      lawyer: "Adv. Priya Sharma",
      specialization: "Civil Law",
      date: "Feb 8, 2025",
      time: "2:30 PM",
      mode: "call",
      status: "confirmed",
      caseTitle: "Consumer Complaint"
    },
    {
      id: 3,
      lawyer: "Adv. Amit Patel",
      specialization: "Property Law",
      date: "Feb 12, 2025",
      time: "11:00 AM",
      mode: "in-person",
      status: "pending",
      caseTitle: "Initial Consultation"
    },
  ];

  const pastAppointments = [
    {
      id: 4,
      lawyer: "Adv. Rajesh Kumar",
      specialization: "Criminal Law",
      date: "Jan 28, 2025",
      time: "3:00 PM",
      mode: "video",
      status: "completed",
      caseTitle: "Property Dispute Case"
    },
    {
      id: 5,
      lawyer: "Adv. Sunita Reddy",
      specialization: "Family Law",
      date: "Jan 20, 2025",
      time: "4:00 PM",
      mode: "chat",
      status: "completed",
      caseTitle: "Legal Advice Session"
    },
  ];

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "video": return <Video className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      case "chat": return <MessageSquare className="h-4 w-4" />;
      case "in-person": return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "completed": return <Badge variant="outline">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: typeof upcomingAppointments[0], isPast?: boolean }) => (
    <Card className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.lawyer}`} />
              <AvatarFallback>{appointment.lawyer.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{appointment.lawyer}</h3>
              <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
              <p className="text-sm text-primary mt-1">{appointment.caseTitle}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {appointment.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {appointment.time}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  {getModeIcon(appointment.mode)}
                  {appointment.mode}
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
              <Link to={`/book-appointment/${appointment.id}`}>
                <Button variant="outline" size="sm">Book Again</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Appointments ({upcomingAppointments.length})
            </h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>

          {/* Past Appointments */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Past Appointments ({pastAppointments.length})
            </h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} isPast />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Appointments;
