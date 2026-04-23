import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "👋 Hello! I'm **NyayaSetu AI**, your legal assistant for the Indian legal framework. Ask me about IPC/BNS sections, court procedures, your rights, or any legal topic.",
};

const ChatAI = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "⚖️ Explain bail procedure in India",
    "📄 How do I file an FIR?",
    "🏛️ Laws on property disputes",
    "⚖️ My rights during arrest",
    "📋 How to draft a legal notice?",
  ];

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  // Load chat history
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data && data.length > 0) {
        setMessages([GREETING, ...data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))]);
      }
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const persist = async (role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      conversation_id: conversationId,
      role,
      content,
    });
  };

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isStreaming || !user) return;

    const userMsg: Msg = { role: "user", content: text };
    const history = messages.filter((m) => m !== GREETING);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    persist("user", text);

    let assistantText = "";
    const upsert = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last !== GREETING) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
        }
        return [...prev, { role: "assistant", content: assistantText }];
      });
    };

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;
      const { data: { session } } = await supabase.auth.getSession();

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...history, userMsg].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Rate limit hit. Try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("AI request failed.");
        setIsStreaming(false);
        return;
      }
      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (assistantText) persist("assistant", assistantText);
    } catch (e) {
      console.error(e);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/client-dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">AI Legal Assistant</span>
          </div>
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 p-6 mb-4 overflow-y-auto" ref={scrollRef as any}>
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div key={i} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Scale className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed
                        prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                        prose-strong:text-foreground prose-li:my-0">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-secondary shrink-0">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Scale className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-2">
            <Input
              placeholder="Ask your legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isStreaming}
              className="flex-1"
            />
            <Button onClick={() => handleSend()} size="icon" className="h-10 w-10" disabled={isStreaming || !input.trim()}>
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="w-80 space-y-4 hidden lg:block">
          <h3 className="font-semibold text-lg mb-4">💡 Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 hover-scale"
                disabled={isStreaming}
                onClick={() => handleSend(prompt.replace(/[⚖️📄🏛️📋]/g, "").trim())}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            ))}
          </div>

          <Card className="p-4 bg-muted/50 mt-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Tips
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Be specific with your questions</li>
              <li>• Provide relevant case details</li>
              <li>• Ask follow-up questions for clarity</li>
              <li>• This is guidance, not legal advice</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
