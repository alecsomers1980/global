"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { company } from "@/lib/content";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.748-.983zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
        fill="currentColor"
      />
    </svg>
  );
}

const waLink = (text: string) =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;

const QUICK_REPLIES = [
  "I'd like a free quote",
  "Borehole drilling",
  "Pump installation / repair",
  "Water testing & filtration",
];

const DEFAULT_MESSAGE =
  "Hi East Lake Drilling, I'd like a free quote for a borehole / water solution.";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open]);

  function send(text?: string) {
    const msg =
      (text ?? message).trim() || DEFAULT_MESSAGE;
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    setMessage("");
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {open && (
        <div className="w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-2xl shadow-2xl overflow-hidden bg-white origin-bottom-right">
          {/* Header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 grid place-items-center shrink-0">
              <WhatsAppGlyph className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">
                {company.name}
              </p>
              <p className="text-xs text-white/70 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                Typically replies in minutes
              </p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="ml-auto text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="bg-[#ECE5DD] px-4 py-4 space-y-3">
            {/* Incoming bubble */}
            <div className="max-w-[85%] bg-white rounded-xl rounded-tl-sm px-3 py-2 text-sm text-ink shadow-sm">
              Hi there 👋 Welcome to East Lake Drilling. How can we help with
              your borehole or water needs?
            </div>

            {/* Quick reply chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => send(reply)}
                  className="rounded-full border border-[#075E54]/30 bg-white text-[#075E54] text-xs px-3 py-1.5 hover:bg-[#075E54]/5 transition"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white px-3 py-3 flex items-center gap-2 border-t border-black/5">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type a message…"
              className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#25D366]/40"
            />
            <button
              aria-label="Send on WhatsApp"
              onClick={() => send()}
              className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5d] transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us on WhatsApp"}
        className="relative w-14 h-14 grid place-items-center rounded-full shadow-lg hover:scale-105 transition bg-[#25D366] text-white"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
        )}
        {open ? (
          <X className="w-7 h-7 relative z-10" />
        ) : (
          <WhatsAppGlyph className="w-7 h-7 relative z-10" />
        )}
      </button>
    </div>
  );
}