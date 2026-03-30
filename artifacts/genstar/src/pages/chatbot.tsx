import { useState, useRef, useEffect } from "react";
import { useSendChatMessage } from "@workspace/api-client-react";
import { Card, Input, Button } from "@/components/UI";
import { Bot, User, Send, Sparkles } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: "GenStar AI Core active. Awaiting your query regarding workflows, telemetry, or personnel." }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const chatMut = useSendChatMessage();

  const handleSend = () => {
    if(!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setInput("");

    chatMut.mutate({ data: { message: userMsg } }, {
      onSuccess: (res) => {
        setMessages(prev => [...prev, {role: 'ai', text: res.response}]);
      },
      onError: () => {
        setMessages(prev => [...prev, {role: 'ai', text: "ERROR: Connection to AI Core severed."}]);
      }
    });
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMut.isPending]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <div className="relative">
          <Bot className="text-primary w-8 h-8 relative z-10" />
          <div className="absolute inset-0 bg-primary blur-xl opacity-50 rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-white">System Oracle</h1>
      </header>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-primary/20 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-accent/10 border border-accent/20 text-white rounded-tr-none' : 'bg-primary/5 border border-primary/10 text-white/90 rounded-tl-none font-light leading-relaxed'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {chatMut.isPending && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles size={16} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary font-mono text-sm">
                Processing query via LLM cluster...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <form 
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Query the database..." 
              className="bg-black/50 border-white/5"
              disabled={chatMut.isPending}
            />
            <Button type="submit" disabled={chatMut.isPending || !input.trim()}>
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
