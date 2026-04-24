import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Lock, Wifi } from "lucide-react";
import { useAppointmentChat, isWithinWindow } from "@/hooks/useAppointmentChat";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  appointmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  currentUserId: string;
  currentUserName: string;
  otherUserName: string;
};

const ChatPane = ({
  appointmentId,
  scheduledAt,
  durationMinutes,
  currentUserId,
  currentUserName,
  otherUserName,
}: Props) => {
  const { messages, isLoading, isSending, sendMessage, bottomRef } =
    useAppointmentChat(appointmentId);
  const [input, setInput] = useState("");
  const [live, setLive] = useState(false);

  // Re-check every 15 seconds if within window
  useEffect(() => {
    const check = () => setLive(isWithinWindow(scheduledAt, durationMinutes));
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [scheduledAt, durationMinutes]);

  const handleSend = async () => {
    if (!input.trim() || !live) return;
    const ok = await sendMessage(currentUserId, input);
    if (ok) setInput("");
  };

  const windowStart = new Date(scheduledAt);
  const windowEnd = new Date(windowStart.getTime() + durationMinutes * 60 * 1000);
  const isUpcoming = new Date() < windowStart;

  return (
    <div className="flex flex-col h-full">
      {/* Status banner */}
      <div className={cn(
        "px-4 py-2 text-sm flex items-center gap-2 border-b",
        live
          ? "bg-green-500/10 text-green-700 border-green-200"
          : "bg-muted text-muted-foreground"
      )}>
        {live ? (
          <><Wifi className="h-4 w-4 animate-pulse" /><span className="font-medium">Live — Chat active until {format(windowEnd, "h:mm a")}</span></>
        ) : isUpcoming ? (
          <><Lock className="h-4 w-4" /><span>Chat opens {formatDistanceToNow(windowStart, { addSuffix: true })} at {format(windowStart, "h:mm a")}</span></>
        ) : (
          <><Lock className="h-4 w-4" /><span>Session ended — Chat is read-only</span></>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {live ? "Say hello to start your consultation!" : "No messages yet."}
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            const name = isMine ? currentUserName : otherUserName;
            return (
              <div key={msg.id} className={cn("flex items-end gap-2", isMine && "flex-row-reverse")}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-xs">
                    {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}>
                  <p>{msg.content}</p>
                  <p className={cn("text-xs mt-1 opacity-70", isMine ? "text-right" : "")}>
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          className={cn(
            "flex-1 rounded-full border px-4 py-2 text-sm outline-none transition-colors",
            live
              ? "border-input bg-background focus:border-primary"
              : "bg-muted cursor-not-allowed text-muted-foreground"
          )}
          placeholder={live ? "Type a message…" : "Chat unavailable outside appointment window"}
          value={input}
          disabled={!live}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button
          size="icon"
          className="rounded-full shrink-0"
          disabled={!live || !input.trim() || isSending}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPane;
