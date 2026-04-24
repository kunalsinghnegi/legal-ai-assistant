import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DirectMessage = {
  id: string;
  appointment_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type AppointmentChat = {
  appointment_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  other_user_id: string;
  other_user_name: string;
  isLive: boolean;
  isUpcoming: boolean;
  windowStart: Date;
  windowEnd: Date;
};

/** Returns true if the current time is within the appointment booking window */
export const isWithinWindow = (scheduledAt: string, durationMinutes: number): boolean => {
  const now = new Date();
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return now >= start && now <= end;
};

export const useAppointmentChat = (appointmentId: string | null) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load initial messages
  useEffect(() => {
    if (!appointmentId) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("direct_messages" as any)
          .select("*")
          .eq("appointment_id", appointmentId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages((data as DirectMessage[]) ?? []);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [appointmentId, scrollToBottom]);

  // Real-time subscription
  useEffect(() => {
    if (!appointmentId) return;
    const channel = supabase
      .channel(`chat:${appointmentId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as DirectMessage]);
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointmentId, scrollToBottom]);

  const sendMessage = useCallback(
    async (senderId: string, content: string) => {
      if (!appointmentId || !content.trim()) return false;
      setIsSending(true);
      try {
        const { error } = await supabase.from("direct_messages" as any).insert({
          appointment_id: appointmentId,
          sender_id: senderId,
          content: content.trim(),
        });
        return !error;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [appointmentId]
  );

  return { messages, isLoading, isSending, sendMessage, bottomRef };
};
