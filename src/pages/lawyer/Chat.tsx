import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import ChatPane from "@/components/ChatPane";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Lock, Wifi, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type ConversationItem = {
  appointment_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  client_id: string;
  client_name: string;
  isLive: boolean;
  isUpcoming: boolean;
};

const LawyerChat = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<ConversationItem | null>(null);
  const [myName, setMyName] = useState("Me");

  useQuery({
    queryKey: ["my_profile_lawyer", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      if (data?.full_name) setMyName(data.full_name);
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["lawyer_chat_list", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: apts, error } = await supabase
        .from("appointments")
        .select("id, scheduled_at, duration_minutes, status, client_id")
        .eq("lawyer_id", user.id)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      if (!apts || apts.length === 0) return [];

      const enriched = await Promise.all(
        apts.map(async (a: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", a.client_id)
            .maybeSingle();
          const now = new Date();
          const start = new Date(a.scheduled_at);
          const end = new Date(start.getTime() + a.duration_minutes * 60 * 1000);
          return {
            appointment_id: a.id,
            scheduled_at: a.scheduled_at,
            duration_minutes: a.duration_minutes,
            status: a.status,
            client_id: a.client_id,
            client_name: profile?.full_name ?? "Client",
            isLive: now >= start && now <= end,
            isUpcoming: now < start,
          } as ConversationItem;
        })
      );
      return enriched;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="lawyer" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Conversation List */}
        <div className="w-80 border-r flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              My Clients
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Chat is live only during the appointment window</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No appointments yet.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.appointment_id}
                  onClick={() => setSelected(c)}
                  className={cn(
                    "w-full text-left p-4 border-b hover:bg-muted/50 transition-colors flex items-center gap-3",
                    selected?.appointment_id === c.appointment_id && "bg-muted"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{c.client_name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {c.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.client_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {format(new Date(c.scheduled_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                  {c.isLive ? (
                    <Badge className="bg-green-500 text-white text-xs gap-1 shrink-0"><Wifi className="h-3 w-3" />Live</Badge>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Chat Area */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b flex items-center gap-3 bg-card">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{selected.client_name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selected.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Appointment: {format(new Date(selected.scheduled_at), "MMM d, yyyy · h:mm a")} · {selected.duration_minutes} min
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ChatPane
                  appointmentId={selected.appointment_id}
                  scheduledAt={selected.scheduled_at}
                  durationMinutes={selected.duration_minutes}
                  currentUserId={user!.id}
                  currentUserName={myName}
                  otherUserName={selected.client_name}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a conversation</h3>
              <p className="text-sm max-w-sm">
                Choose a client from the list. The chat will unlock automatically when their appointment window starts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerChat;
