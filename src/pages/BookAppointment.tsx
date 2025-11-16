import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Scale, ArrowLeft, Calendar as CalendarIcon, Phone, MessageSquare, Video, MapPin, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const BookAppointment = () => {
  const { lawyerId } = useParams();
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [mode, setMode] = useState("video");

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const handleBooking = () => {
    toast.success("Appointment booked successfully! You'll receive a confirmation email.");
  };

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
          <p className="text-muted-foreground mb-8">Schedule a consultation with Adv. Rajesh Kumar</p>

          <div className="grid lg:grid-cols-2 gap-8">
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
                    <select id="caseType" className="w-full mt-1.5 px-3 py-2 border border-border rounded-md bg-background">
                      <option>Property Dispute</option>
                      <option>Criminal Defense</option>
                      <option>Civil Litigation</option>
                      <option>Family Law</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Brief Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Please describe your case briefly..."
                      className="mt-1.5"
                      rows={4}
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
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setSelectedTime(time)}
                        >
                          {selectedTime === time && <Check className="h-4 w-4 mr-2" />}
                          {time}
                        </Button>
                      ))}
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
                      <span className="font-medium">Adv. Rajesh Kumar</span>
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
                      <span className="font-medium">₹2,000</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="font-medium">₹200</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹2,200</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!date || !selectedTime}
                    onClick={handleBooking}
                  >
                    Confirm Booking
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    You can reschedule or cancel up to 24 hours before the appointment
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointment;
