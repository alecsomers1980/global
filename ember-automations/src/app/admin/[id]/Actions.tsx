"use client";
import { useState } from "react";

export default function Actions({ id, markdown, status }: {
  id: string; markdown: string; status: string;
}) {
  const [msg, setMsg] = useState("");
  const [fu, setFu] = useState("");

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setMsg("Markdown copied — paste into review-intake.");
  };

  const ready = async () => {
    await fetch(`/api/admin/questionnaires/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ready_to_quote" }),
    });
    location.reload();
  };

  const sendFollowUps = async () => {
    const lines = fu.split("\n").map(s => s.trim()).filter(Boolean);
    if (!lines.length) return;
    await fetch(`/api/admin/questionnaires/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addFollowUps: lines }),
    });
    location.reload();
  };

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <button className="bg-dark-600 px-4 py-2 rounded-lg" onClick={copy}>
          Copy export for review-intake
        </button>
        {status !== "ready_to_quote" && (
          <button className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg" onClick={ready}>
            Mark ready to quote
          </button>
        )}
        {msg && <span className="text-[#6b6b8a] text-sm">{msg}</span>}
      </div>

      <div>
        <textarea
          className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2"
          rows={3}
          placeholder="Approved follow-up questions, one per line (from review-intake)"
          value={fu}
          onChange={e => setFu(e.target.value)}
        />
        <button
          className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg mt-2"
          onClick={sendFollowUps}
        >
          Send follow-ups to client
        </button>
      </div>
    </div>
  );
}
