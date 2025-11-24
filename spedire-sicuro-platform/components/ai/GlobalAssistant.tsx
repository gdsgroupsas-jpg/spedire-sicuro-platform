"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "ai";
  content: string;
};

export function GlobalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Ciao. Sono il Neural Core di Spedire Sicuro. Analizzo i tuoi dati in tempo reale. Come posso ottimizzare il tuo lavoro oggi?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automatico
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          context: `L'utente si trova alla pagina: ${pathname}.` 
        }),
      });
      
      const data = await res.json();
      
      if (data.response) {
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Errore di connessione col Neural Core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[380px] shadow-2xl"
          >
            <Card className="border-amber-500/20 bg-black/95 backdrop-blur-md border text-white">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-yellow-600 p-4 rounded-t-lg flex flex-row justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-white" />
                  <CardTitle className="text-sm font-bold text-white">Logistic Neural Core</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 text-white hover:bg-white/20">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={scrollRef} className="h-[350px] overflow-y-auto p-4 space-y-4 bg-zinc-900/50">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        m.role === "user" 
                          ? "bg-amber-600 text-white" 
                          : "bg-zinc-800 text-gray-100 border border-zinc-700"
                      }`}>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                        <span className="text-xs text-gray-400">Analisi in corso...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-zinc-800 bg-black">
                  <div className="flex gap-2">
                    <Input 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Chiedi al sistema..." 
                      className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500"
                    />
                    <Button onClick={handleSend} size="icon" className="bg-amber-500 hover:bg-amber-600 text-black">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/20 flex items-center justify-center text-black font-bold"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
