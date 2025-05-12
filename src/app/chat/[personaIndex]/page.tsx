'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Persona } from "@/types";
import { ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import ResponseHints from "@/components/ResponseHints";

export default function ChatPage() {
  const { personaIndex } = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [pendingReply, setPendingReply] = useState("");
  const [isPersonaInfoVisible, setIsPersonaInfoVisible] = useState(true);
  const [isHintsVisible, setIsHintsVisible] = useState(true); // Set default to open
  const [hints, setHints] = useState([
    "Ask open-ended questions about their challenge",
    "Show empathy for their specific situation",
    "Introduce yourself and establish rapport",
    "Listen carefully to their initial concerns",
    "Clarify what kind of help they're seeking"
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const stored = localStorage.getItem("personas");
    if (!stored) {
      console.warn("No personas found in localStorage. Redirecting...");
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const index = parseInt(personaIndex as string);
      if (isNaN(index) || !parsed[index]) {
        console.warn("Invalid index");
        router.push("/");
        return;
      }

      const selected = parsed[index];
      setPersona(selected);

      setMessages([
        {
          role: "assistant",
          content: `Hi, I'm ${selected.name}. I'm having trouble with ${selected.challenge}. Can you help?`,
        },
      ]);
    } catch (err) {
      console.error("Failed to parse personas:", err);
      router.push("/");
    }
  }, [personaIndex, router]);

  const sendMessage = async () => {
    if (!input.trim() || !persona) return;
  
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");
    setTyping(true);
    setPendingReply("..."); // show "..."
  
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, messages: updated }),
      });
  
      const data = await res.json();
      const fullReply = data.reply;
      
      // Update hints if available
      if (data.hints && Array.isArray(data.hints) && data.hints.length > 0) {
        setHints(data.hints);
      }
  
      // Wait for 0.3s per word
      const wordCount = fullReply.trim().split(/\s+/).length;
      const delay = Math.min(wordCount * 300, 5000); // cap at 5s max
  
      setTimeout(() => {
        setMessages([...updated, { role: "assistant", content: fullReply }]);
        setTyping(false);
        setPendingReply("");
      }, delay);
    } catch (err) {
      console.error("Chat error:", err);
      setTyping(false);
      setPendingReply("");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  if (!persona) {
    return <p className="p-6 text-center text-gray-500">🔄 Loading persona...</p>;
  }

  return (
    <main className="max-w-5xl mx-auto p-6 flex flex-col h-screen">
      <button
        onClick={() => router.push("/")}
        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mb-4"
      >
        <span className="text-lg">←</span> Back to Persona List
      </button>

      <div className="mb-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <div 
          className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setIsPersonaInfoVisible(!isPersonaInfoVisible)}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg"><span className="font-bold">Speaking with:</span> {persona.name}, {persona.age}</h3>
          </div>
          <motion.div
            animate={{ rotate: isPersonaInfoVisible ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ height: "auto" }}
          animate={{ 
            height: isPersonaInfoVisible ? "auto" : 0,
            opacity: isPersonaInfoVisible ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          style={{ overflow: "hidden" }}
        >
          <div className="p-4 text-xs border-t border-gray-200">
            <p className="mb-1"><strong className="text-xs text-slate-500">Job Title:</strong> {persona.jobTitle}</p>
            <p className="mb-1"><strong className="text-xs text-slate-500">Location:</strong> {persona.location}</p>
            <p className="mb-1"><strong className="text-xs text-slate-500">Challenge:</strong> {persona.challenge}</p>
            <p><strong className="text-sm text-slate-500">Interests:</strong> {Array.isArray(persona.interests) ? persona.interests.join(", ") : persona.interests}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4 mb-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 border border-gray-200 p-4 rounded-lg bg-white shadow-md flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg shadow-sm hover:shadow transition-shadow max-w-[85%] ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-100 text-gray-800"
                } mb-3`}
              >
                <p className="text-sm">{msg.content}</p>
              </motion.div>
            ))}

            {/* Typing animation */}
            {typing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg shadow-sm max-w-[85%] mr-auto bg-gray-100 text-gray-800"
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Hints Menu */}
        <div className="w-72 flex flex-col">
          <ResponseHints 
            hints={hints} 
            isVisible={isHintsVisible} 
            toggleVisibility={() => setIsHintsVisible(!isHintsVisible)} 
          />
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <textarea
          className="flex-1 p-2 focus:outline-none resize-none min-h-[60px]"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={typing}
          rows={2}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || typing || !input.trim()}
        >
          {loading || typing ? "..." : "Send"}
        </button>
      </div>
    </main>
  );
}
