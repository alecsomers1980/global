import { serviceClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import { detectGaps } from "@/lib/gapDetection";
import { exportSubmissionMarkdown } from "@/lib/exportMarkdown";
import type { Questionnaire, AnswerScalar } from "@/lib/types";
import Actions from "./Actions";

export const dynamic = "force-dynamic";

function fmt(v: AnswerScalar | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return Object.entries(v).map(([k, t]) => `${k}: ${t}`).join(" · ");
  return String(v);
}

export default async function SubmissionView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = serviceClient();
  const { data } = await db.from("questionnaires").select("*").eq("id", id).single();
  if (!data) notFound();
  const qn = data as Questionnaire;

  const { missingCritical, moscow, warnings } = detectGaps(qn.question_set, qn.answers);
  const md = exportSubmissionMarkdown(qn);
  const rounds = [...new Set(qn.question_set.map(q => q.round))].sort();

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h1 className="text-2xl font-bold">{qn.client_name} — {qn.project_name}</h1>
        <p className="text-[#6b6b8a] text-sm mt-1">Status: {qn.status} · /intake/{qn.slug}</p>
      </div>

      <div className="glass p-6">
        <h2 className="font-bold mb-3">Deterministic flags</h2>
        <p>
          <span className="text-[#6b6b8a]">Missing critical:</span>{" "}
          {missingCritical.length ? missingCritical.map(q => q.label).join("; ") : "none"}
        </p>
        <p><span className="text-[#6b6b8a]">MoSCoW Musts:</span> {moscow.Must.join(", ") || "—"}</p>
        {warnings.map((w, i) => <p key={i} className="text-ember-500 mt-1">⚠ {w}</p>)}
      </div>

      <div className="glass p-6 space-y-4">
        <h2 className="font-bold">Answers</h2>
        {rounds.map(r => (
          <div key={r} className="space-y-4">
            {rounds.length > 1 && (
              <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">Round {r}</p>
            )}
            {qn.question_set.filter(q => q.round === r).map(q => (
              <div key={q.id}>
                <p className="font-semibold">
                  {q.label}{q.critical && <span className="text-ember-500"> *</span>}
                </p>
                <p className="text-[#c9c9de] whitespace-pre-wrap">{fmt(qn.answers[q.id]?.value)}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Actions id={qn.id} markdown={md} status={qn.status} />
    </div>
  );
}
