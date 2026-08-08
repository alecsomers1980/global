import type { Question, AnswerValue, MoscowTag } from "./types";

const TAGS: MoscowTag[] = ["Must", "Should", "Could", "Not-yet"];
type Answers = Record<string, AnswerValue>;

export function isBlank(v: AnswerValue | undefined): boolean {
  if (!v) return true;
  const x = v.value;
  if (x === null || x === undefined) return true;
  if (typeof x === "string") return x.trim() === "";
  if (Array.isArray(x)) return x.length === 0;
  if (typeof x === "object") return Object.keys(x).length === 0;
  return false;
}

export function moscowSummary(qs: Question[], answers: Answers): Record<MoscowTag, string[]> {
  const out: Record<MoscowTag, string[]> = { Must: [], Should: [], Could: [], "Not-yet": [] };
  for (const q of qs.filter(q => q.type === "moscow")) {
    const val = answers[q.id]?.value;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (const [feature, tag] of Object.entries(val as Record<string, MoscowTag>)) {
        if (TAGS.includes(tag)) out[tag].push(feature);
      }
    }
  }
  return out;
}

export function detectGaps(qs: Question[], answers: Answers) {
  const missingCritical = qs.filter(q => q.critical && isBlank(answers[q.id]));
  const moscow = moscowSummary(qs, answers);
  const warnings: string[] = [];
  const posture = answers["core.posture"]?.value;
  if (posture === "Everything from day one" && moscow.Must.length >= 4) {
    warnings.push(`"Everything from day one" with ${moscow.Must.length} Must-have features — likely over-scoped for budget. Consider phasing (see anti-oversell rule).`);
  }
  return { missingCritical, moscow, warnings };
}
