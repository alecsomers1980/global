"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OutboxRow } from "@/lib/spine/types";

type Draft = Record<string, unknown>;

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function localInputToISO(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function getEstimate(draft: Draft): {
  summary?: string;
  due_by?: string | null;
  assumptions?: string[];
} {
  return (draft.estimate ?? {}) as {
    summary?: string;
    due_by?: string | null;
    assumptions?: string[];
  };
}

function parseQuestions(draft: Draft): { text: string; why?: string }[] {
  const raw = draft.questions;
  if (!Array.isArray(raw)) return [];

  return raw.map((question) => {
    const value = (question ?? {}) as { text?: string; why?: string };
    return {
      text: String(value.text ?? ""),
      why: value.why ? String(value.why) : undefined,
    };
  });
}

function parseEstimateSize(draft: Draft): "S" | "M" | "L" {
  const size = String(draft.size ?? "M");
  return size === "S" || size === "M" || size === "L" ? size : "M";
}

function parseCredits(draft: Draft): string {
  const credits = draft.credits;
  return credits !== undefined && credits !== null ? String(credits) : "";
}

function parseSummary(draft: Draft): string {
  const estimate = getEstimate(draft);
  return estimate.summary !== undefined ? String(estimate.summary) : "";
}

function parseDueBy(draft: Draft): string {
  return toLocalInputValue(getEstimate(draft).due_by);
}

function parseAssumptions(draft: Draft): string {
  const assumptions = getEstimate(draft).assumptions;
  return Array.isArray(assumptions) ? assumptions.map(String).join("\n") : "";
}

function parseTitle(draft: Draft): string {
  return draft.title !== undefined ? String(draft.title) : "";
}

function parseText(draft: Draft): string {
  return draft.text !== undefined ? String(draft.text) : "";
}

function parseStatements(draft: Draft): string[] {
  return Array.isArray(draft.statements) ? draft.statements.map(String) : [];
}

export default function QueueItem({
  item,
  balanceAfter,
}: {
  item: OutboxRow & { client_name: string };
  balanceAfter: number | null;
}) {
  const draft = item.draft as Draft;
  const router = useRouter();

  const initial = useMemo(
    () => ({
      questions: parseQuestions(draft),
      size: parseEstimateSize(draft),
      credits: parseCredits(draft),
      summary: parseSummary(draft),
      dueBy: parseDueBy(draft),
      assumptions: parseAssumptions(draft),
      title: parseTitle(draft),
      text: parseText(draft),
    }),
    [draft]
  );

  const [questions, setQuestions] = useState(initial.questions);
  const [size, setSize] = useState<"S" | "M" | "L">(initial.size);
  const [credits, setCredits] = useState(initial.credits);
  const [summary, setSummary] = useState(initial.summary);
  const [dueBy, setDueBy] = useState(initial.dueBy);
  const [assumptions, setAssumptions] = useState(initial.assumptions);
  const [title, setTitle] = useState(initial.title);
  const [text, setText] = useState(initial.text);

  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<{ link: string; emailed: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const statements = useMemo(() => parseStatements(draft), [draft]);

  const edited = useMemo(() => {
    switch (item.kind) {
      case "question_batch":
        return JSON.stringify(questions) !== JSON.stringify(initial.questions);
      case "estimate":
        return (
          size !== initial.size ||
          credits !== initial.credits ||
          summary !== initial.summary ||
          dueBy !== initial.dueBy ||
          assumptions !== initial.assumptions
        );
      case "status_note":
      case "reply":
        return title !== initial.title || text !== initial.text;
      default:
        return false;
    }
  }, [assumptions, credits, dueBy, initial, item.kind, questions, size, summary, text, title]);

  function updateQuestionText(index: number, value: string) {
    setQuestions((prev) => prev.map((question, i) => (i === index ? { ...question, text: value } : question)));
  }

  function buildFinal(): Draft {
    const final = { ...draft };

    switch (item.kind) {
      case "question_batch":
        final.questions = questions;
        break;
      case "estimate":
        final.size = size;
        final.credits = Number(credits);
        final.estimate = {
          summary,
          credits: Number(credits),
          due_by: localInputToISO(dueBy),
          assumptions: assumptions
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        };
        break;
      case "status_note":
      case "reply":
        final.title = title;
        final.text = text;
        break;
      case "fact_update":
        break;
    }

    return final;
  }

  async function handleApprove() {
    setError("");
    setOutcome(null);

    const res = await fetch(`/api/admin/spine/outbox/${item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: edited ? "edited" : "approved",
        final: buildFinal(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to approve");
      return;
    }

    if (data.link) {
      setOutcome({ link: data.link, emailed: Boolean(data.emailed) });
    }

    router.refresh();
  }

  async function handleReject() {
    setError("");
    setOutcome(null);

    const res = await fetch(`/api/admin/spine/outbox/${item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "rejected" }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to reject");
      return;
    }

    router.refresh();
  }

  async function copyLink() {
    if (!outcome) return;

    try {
      await navigator.clipboard.writeText(outcome.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  return (
    <div className="border-t border-[#2a2a3d] pt-4">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
        <div className="font-semibold">{item.client_name}</div>
        <span className="text-xs uppercase tracking-wide text-ember-500">{item.kind}</span>
        <span className="text-[#6b6b8a] text-sm">
          {new Date(item.created_at).toLocaleDateString("en-ZA")}
        </span>
      </div>

      {item.kind === "question_batch" ? (
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div key={index} className="space-y-1">
              <input
                value={question.text}
                onChange={(event) => updateQuestionText(index, event.target.value)}
                className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
                placeholder={`Question ${index + 1}`}
              />
              {question.why ? (
                <p className="text-[#6b6b8a] text-sm">{question.why}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {item.kind === "estimate" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Size</label>
            <select
              value={size}
              onChange={(event) => setSize(event.target.value as "S" | "M" | "L")}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </div>

          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Credits</label>
            <input
              type="number"
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Summary</label>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={3}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Due by</label>
            <input
              type="datetime-local"
              value={dueBy}
              onChange={(event) => setDueBy(event.target.value)}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Assumptions (one per line)</label>
            <textarea
              value={assumptions}
              onChange={(event) => setAssumptions(event.target.value)}
              rows={4}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {balanceAfter !== null && balanceAfter < 0 ? (
            <p className="text-red-400 text-sm">
              Balance would go to {balanceAfter} credits — approving means the client goes negative.
            </p>
          ) : null}
        </div>
      ) : null}

      {item.kind === "status_note" || item.kind === "reply" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[#6b6b8a] text-sm mb-1">Text</label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      ) : null}

      {item.kind === "fact_update" ? (
        <ul className="space-y-1">
          {statements.map((statement, index) => (
            <li key={index} className="text-sm">{statement}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleApprove}
          className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          className="border border-[#2a2a3d] text-red-400 px-4 py-2 rounded-lg text-sm"
        >
          Reject
        </button>
      </div>

      {error ? <div className="mt-3 text-red-400 text-sm">{error}</div> : null}

      {outcome ? (
        <div className="mt-3 space-y-2">
          <p className="text-[#6b6b8a] text-sm">
            {outcome.emailed
              ? "Link sent"
              : "No recipient email — deliver this link by hand:"}
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={outcome.link}
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={copyLink}
              className="bg-dark-600 px-4 py-2 rounded-lg text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
