import type { ReportFacts } from "./facts";
import type { Suggestion } from "@/lib/ai/suggest";

export interface ReportSuggestion extends Suggestion {
  credits: number;
}

export interface ReportBody {
  version: 1;
  period: string;
  period_label: string;
  client_name: string;
  facts: ReportFacts;
  suggestions: ReportSuggestion[];
  generated_at: string;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function creditWord(n: number): string {
  return `${n} ${n === 1 ? "credit" : "credits"}`;
}

export function emailSummary(body: ReportBody): string[] {
  const { facts } = body;
  const lines: string[] = [];

  if (facts.delivered.length > 0) {
    lines.push(
      `Delivered in ${body.period_label}: ${plural(facts.delivered.length, "request", "requests")} (${creditWord(facts.credits_used)}).`
    );
  }

  if (facts.in_flight.length > 0) {
    lines.push(`In progress now: ${plural(facts.in_flight.length, "request", "requests")}.`);
  }

  if (facts.waiting.length > 0) {
    const questions = facts.waiting.filter((item) => item.kind === "question").length;
    const estimates = facts.waiting.filter((item) => item.kind === "estimate").length;
    const parts: string[] = [];

    if (questions > 0) {
      parts.push(plural(questions, "question", "questions"));
    }

    if (estimates > 0) {
      parts.push(plural(estimates, "estimate", "estimates"));
    }

    lines.push(`Waiting on you: ${parts.join(" and ")}.`);
  }

  if (body.suggestions.length > 0) {
    lines.push(`${plural(body.suggestions.length, "suggestion", "suggestions")} for next month.`);
  }

  if (lines.length === 0) {
    lines.push(`A quiet ${body.period_label} — nothing was delivered and nothing is in progress.`);
  }

  if (facts.balance < 0) {
    lines.push(`Credit balance: ${creditWord(facts.balance)} (we have run ahead of the plan).`);
  } else {
    lines.push(`Credit balance: ${creditWord(facts.balance)}.`);
  }

  return lines;
}

export function reportHeading(body: ReportBody): string {
  return `${body.client_name} — ${body.period_label}`;
}

export function sectionCount(body: ReportBody): number {
  const { facts } = body;

  return (
    (facts.delivered.length > 0 ? 1 : 0) +
    (facts.in_flight.length > 0 ? 1 : 0) +
    (facts.waiting.length > 0 ? 1 : 0) +
    (body.suggestions.length > 0 ? 1 : 0) +
    (facts.check_ins.length > 0 ? 1 : 0)
  );
}

