import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Scale, ArrowLeft, Calendar as CalendarIcon, Phone, MessageSquare, Video, MapPin, Check, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const BookAppointment = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [mode, setMode] = useState("video");
  const [caseType, setCaseType] = useState("Property Dispute");
  const [caseDescription, setCaseDescription] = useState("");

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  // Fetch Lawyer Details
  const { data: lawyerProfile, isLoading: isLawyerLoading } = useQuery({
    queryKey: ["lawyer", lawyerId],
    queryFn: async () => {
      if (!lawyerId) return null;
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", lawyerId)
        .single();
        
      if (profileError) throw profileError;

      const { data: lawyerData, error: lawyerError } = await supabase
        .from("lawyers")
        .select("hourly_rate")
        .eq("user_id", lawyerId)
        .single();
        
      if (lawyerError && lawyerError.code !== 'PGRST116') throw lawyerError;

      return {
        name: profileData?.full_name || "Advocate",
        fee: lawyerData?.hourly_rate || 2000
      };
    },
    enabled: !!lawyerId,
  });

  // Check for existing active requests
  const { data: existingRequest, isLoading: isRequestLoading } = useQuery({
    queryKey: ["existing_request", user?.id, lawyerId],
    queryFn: async () => {
      if (!user?.id || !lawyerId) return null;
      const { data } = await supabase
        .from("client_requests")
        .select("id, status")
        .eq("client_id", user.id)
        .eq("lawyer_id", lawyerId)
        .in("status", ["pending", "accepted"])
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && !!lawyerId,
  });

  // Fetch existing appointments for the selected date
  const { data: bookedTimes = [], isLoading: isBookedTimesLoading } = useQuery({
    queryKey: ["booked_times", lawyerId, date?.toISOString()],
    queryFn: async () => {
      if (!lawyerId || !date) return [];
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("appointments")
        .select("scheduled_at")
        .eq("lawyer_id", lawyerId)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString());

      if (error) throw error;

      // Convert scheduled_at to "HH:MM AM/PM" matching our timeSlots format
      return data.map(apt => {
        const aptDate = new Date(apt.scheduled_at);
        let hours = aptDate.getHours();
        const minutes = aptDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const hoursStr = hours < 10 ? '0' + hours : hours;
        return `${hoursStr}:${minutesStr} ${ampm}`;
      });
    },
    enabled: !!lawyerId && !!date,
  });

  // Booking Mutation
  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !lawyerId || !date || !selectedTime) throw new Error("Missing required fields");

      // 1. Create a new case
      const { data: newCase, error: caseError } = await supabase
        .from("cases")
        .insert({
          client_id: user.id,
          title: `${caseType} Consultation`,
          description: caseDescription || "Initial consultation",
          category: caseType,
          status: "open",
          urgency: "medium",
        })
        .select()
        .single();

      if (caseError) throw new Error(`Case Error: ${caseError.message}`);

      // Parse time string to Date object
      const [time, period] = selectedTime.split(" ");
      let [hours] = time.split(":").map(Number);
      const minutes = Number(time.split(":")[1]);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Map frontend mode to DB enum (online | in_person)
      const dbMode = mode === "person" ? "in_person" : "online";
      const { data: appointment, error: aptError } = await supabase
        .from("appointments")
        .insert({
          client_id: user.id,
          lawyer_id: lawyerId,
          case_id: newCase.id,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 30,
          mode: dbMode as any,
          status: "pending",
          notes: `${mode} consultation. ${caseDescription}`
        })
        .select()
        .single();

      if (aptError) throw new Error(`Appointment Error: ${aptError.message}`);

      // 3. Notify lawyer via client_requests
      const { error: requestError } = await supabase
        .from("client_requests")
        .insert({
          client_id: user.id,
          lawyer_id: lawyerId,
          case_id: newCase.id,
          message: `New consultation request for ${scheduledAt.toLocaleString()}`,
          status: "pending"
        });

      if (requestError) throw new Error(`Request Error: ${requestError.message}`);

      return appointment;
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully! The lawyer has been notified.");
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["cases", user?.id] });
      setTimeout(() => {
        navigate("/client/appointments");
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to book appointment");
    }
  });

  const handleBooking = () => {
    bookMutation.mutate();
  };

  const consultationFee = lawyerProfile?.fee || 2000;
  const platformFee = Math.round(consultationFee * 0.1);
  const totalFee = consultationFee + platformFee;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/lawyer/${lawyerId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
          <p className="text-muted-foreground mb-8">Schedule a consultation with {lawyerProfile?.name || "the lawyer"}</p>

          <div className="grid lg:grid-cols-2 gap-8">
            {existingRequest ? (
              <Card className="lg:col-span-2 border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 py-12">
                  <AlertCircle className="h-12 w-12 text-yellow-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">Active Booking Found</h3>
                    <p className="text-yellow-700 max-w-md mx-auto">
                      You already have a <span className="font-bold uppercase">{existingRequest.status}</span> request with this lawyer. 
                      Please wait for them to respond or manage it in your dashboard before booking another consultation.
                    </p>
                  </div>
                  <Link to="/client-dashboard" className="mt-4 inline-block">
                    <Button variant="outline" className="border-yellow-500 text-yellow-800 hover:bg-yellow-500/20">Return to Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Left Column - Booking Form */}
                <div className="space-y-6">
              {/* Mode Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consultation Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={mode} onValueChange={setMode} className="grid grid-cols-2 gap-4">
                    {[
                      { value: "video", icon: Video, label: "Video Call" },
                      { value: "phone", icon: Phone, label: "Phone Call" },
                      { value: "chat", icon: MessageSquare, label: "Chat" },
                      { value: "person", icon: MapPin, label: "In-Person" }
                    ].map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                        <Label
                          htmlFor={option.value}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                        >
                          <option.icon className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border pointer-events-auto"
                  />
                </CardContent>
              </Card>

              {/* Case Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="caseType">Case Type</Label>
                    <select 
                      id="caseType" 
                      className="w-full mt-1.5 px-3 py-2 border border-border rounded-md bg-background"
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                    >
                      <option value="Property Law">Property Law</option>
                      <option value="Criminal Defense">Criminal Defense</option>
                      <option value="Civil Litigation">Civil Litigation</option>
                      <option value="Family Law">Family Law</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Brief Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Please describe your case briefly..."
                      className="mt-1.5"
                      rows={4}
                      value={caseDescription}
                      onChange={(e) => setCaseDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Time Slots & Summary */}
            <div className="space-y-6">
              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  {date ? (
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => {
                        const isBooked = bookedTimes.includes(time);
                        return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`justify-start ${isBooked ? "opacity-50" : ""}`}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked || isBookedTimesLoading}
                        >
                          {selectedTime === time && !isBooked && <Check className="h-4 w-4 mr-2" />}
                          {time} {isBooked && "(Booked)"}
                        </Button>
                      )})}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Please select a date first
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Booking Summary */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lawyer</span>
                      <span className="font-medium">{lawyerProfile?.name || "Loading..."}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium capitalize">{mode.replace("-", " ")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {date ? date.toLocaleDateString() : "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{selectedTime || "Not selected"}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="font-medium">₹{consultationFee}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="font-medium">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{totalFee}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!date || !selectedTime || bookMutation.isPending}
                    onClick={handleBooking}
                  >
                    {bookMutation.isPending ? "Confirming..." : "Confirm Booking"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    You can reschedule or cancel up to 24 hours before the appointment
                  </p>
                </CardContent>
              </Card>
            </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
