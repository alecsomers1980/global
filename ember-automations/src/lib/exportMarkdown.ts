import type { Questionnaire, AnswerScalar } from "./types";
import { detectGaps } from "./gapDetection";

function renderValue(v: AnswerScalar): string {
  if (v === null || v === undefined || v === "") return "_(no answer)_";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return Object.entries(v).map(([k, t]) => `${k}: **${t}**`).join(" · ");
  return String(v);
}

export function exportSubmissionMarkdown(qn: Questionnaire): string {
  const rounds = [...new Set(qn.question_set.map(q => q.round))].sort();
  const lines: string[] = [
    `# ${qn.client_name} — ${qn.project_name}`,
    ``,
    `- **Type:** ${qn.type}`,
    `- **Status:** ${qn.status}`,
    `- **Slug:** ${qn.slug}`,
    ``,
  ];
  for (const r of rounds) {
    if (rounds.length > 1) lines.push(`## Round ${r}`, ``);
    for (const q of qn.question_set.filter(q => q.round === r)) {
      const a = qn.answers[q.id]?.value ?? null;
      lines.push(`**${q.label}**${q.critical ? " ⏳" : ""}`, renderValue(a), ``);
    }
  }
  const { missingCritical, moscow, warnings } = detectGaps(qn.question_set, qn.answers);
  lines.push(`## Deterministic flags`, ``);
  lines.push(`- **Missing critical:** ${missingCritical.length ? missingCritical.map(q => q.label).join("; ") : "none"}`);
  lines.push(`- **MoSCoW — Must:** ${moscow.Must.join(", ") || "—"}`);
  lines.push(`- **Warnings:** ${warnings.length ? warnings.join(" ") : "none"}`);
  return lines.join("\n");
}
