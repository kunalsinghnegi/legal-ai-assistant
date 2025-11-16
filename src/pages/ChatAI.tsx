import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scale, ArrowLeft, Send, Sparkles } from "lucide-react";

const ChatAI = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Legal Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const suggestedPrompts = [
    "⚖️ Explain bail procedure in India",
    "📄 Help me understand how to file an FIR",
    "🏛️ What laws apply to property disputes?",
    "⚖️ Explain my rights during arrest",
    "📋 How to draft a legal notice?"
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, 
      { role: "user", content: input },
      { role: "assistant", content: "I understand your question. Based on Indian legal framework, let me explain..." }
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/client-dashboard" className="flex items-center gap-2">
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
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 p-6 mb-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div key={i} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Scale className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-secondary">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input 
              placeholder="Ask your legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" className="h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Suggested Prompts Sidebar */}
        <div className="w-80 space-y-4">
          <h3 className="font-semibold text-lg mb-4">💡 Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 hover-scale"
                onClick={() => setInput(prompt.replace(/[⚖️📄🏛️📋]/g, "").trim())}
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
              <li>• This is for guidance, not legal advice</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
