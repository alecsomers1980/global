"use client";
import { useState } from "react";
import { MODULES } from "@/lib/questionBank";
import type { ModuleId } from "@/lib/types";

const MODULE_LABELS: Record<ModuleId, string> = {
  A: "Marketing website",
  B: "Web app / internal tool",
};

export default function NewQuestionnaire() {
  const [f, setF] = useState({ client_name: "", project_name: "", type: "website" });
  const [mods, setMods] = useState<ModuleId[]>([]);
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (m: ModuleId) =>
    setMods(s => (s.includes(m) ? s.filter(x => x !== m) : [...s, m]));

  const create = async () => {
    setErr(null); setBusy(true);
    const res = await fetch("/api/admin/questionnaires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, modules: mods }),
    });
    const j = await res.json();
    setBusy(false);
    if (j.slug) setLink(`${location.origin}/intake/${j.slug}`);
    else setErr(j.error || "Something went wrong");
  };

  const cls = "w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3";

  if (link) {
    return (
      <div className="glass p-6">
        <h2 className="font-bold mb-2">Link ready</h2>
        <a className="text-ember-500 break-all" href={link}>{link}</a>
        <p className="text-[#6b6b8a] text-sm mt-2">Send this to the client.</p>
        <button
          className="bg-dark-600 px-4 py-2 rounded-lg mt-4 text-sm"
          onClick={() => navigator.clipboard.writeText(link)}
        >
          Copy link
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-6 space-y-2">
      <h1 className="text-xl font-bold mb-4">New questionnaire</h1>
      <input className={cls} placeholder="Client name" onChange={e => setF({ ...f, client_name: e.target.value })} />
      <input className={cls} placeholder="Project name" onChange={e => setF({ ...f, project_name: e.target.value })} />
      <select className={cls} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
        <option value="website">New website</option>
        <option value="tool">Web app / internal tool</option>
        <option value="existing">Existing project</option>
      </select>

      <p className="font-semibold mt-2 mb-1">Modules</p>
      {(Object.keys(MODULES) as ModuleId[]).map(m => (
        <label key={m} className="flex items-center gap-2">
          <input type="checkbox" checked={mods.includes(m)} onChange={() => toggle(m)} />
          Module {m} — {MODULE_LABELS[m]}
        </label>
      ))}

      <button
        className="bg-ember-500 text-[#0a0a0f] font-semibold px-5 py-2 rounded-lg mt-4 disabled:opacity-50"
        onClick={create}
        disabled={busy}
      >
        {busy ? "Creating…" : "Generate link"}
      </button>
      {err && <p className="text-ember-500 text-sm mt-2">{err}</p>}
    </div>
  );
}
