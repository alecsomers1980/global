'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AskRiverviewChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m the Riverview Prep assistant. I have access to our live school data — events, staff, calendar, newsletters, and more. Ask me anything!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sessionId = useRef(Math.random().toString(36).substring(7));

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId: sessionId.current }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting. Please try again or email info@riverviewprep.org.' }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-green text-white rounded-full shadow-xl hover:bg-brand-green/90 hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Ask Riverview"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold rounded-full flex items-center justify-center text-[8px] font-bold">AI</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-brand-green/10 overflow-hidden flex flex-col" style={{ height: '520px', maxHeight: 'calc(100vh - 6rem)' }}>
          {/* Header */}
          <div className="bg-brand-green text-white p-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-sm">Ask Riverview</h3>
              <p className="text-white/60 text-[10px]">AI Assistant — Beta</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-cream/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-green text-white rounded-br-md'
                    : 'bg-white text-brand-green/80 border border-brand-green/5 rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-brand-green/5">
                  <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-brand-green/5 flex gap-2 bg-white shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about fees, admissions, calendar..."
              className="flex-1 px-4 py-2.5 bg-brand-cream/50 border border-brand-green/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-[9px] text-brand-green/25 py-1.5 bg-brand-cream/50 shrink-0">
            Powered by AI · Verify important info with the school office
          </p>
        </div>
      )}
    </>
  );
}
