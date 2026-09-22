"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  token: string;
  mode: "estimate" | "questions";
  updatedAt?: string;
  questions?: { id: string; text: string }[];
};

export default function LinkActions({ token, mode, updatedAt, questions = [] }: Props) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitEstimate(action: "approve" | "decline") {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/c/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          updated_at: updatedAt,
          ...(comment.trim() ? { reason: comment.trim() } : {}),
        }),
      });

      const body = await res.json().catch(() => ({ error: "Something went wrong" }));

      if (!res.ok) {
        if (res.status === 409) {
          setError("This request was updated — refresh the page and try again.");
        } else {
          setError(body.error ?? "Something went wrong");
          router.refresh();
        }
        return;
      }

      setSuccess("Thank you — Ember has been notified.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAnswers(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const nonEmpty = questions
      .map((q) => ({
        question_id: q.id,
        answer: (answers[q.id] ?? "").trim(),
      }))
      .filter((a) => a.answer !== "");

    if (nonEmpty.length === 0) {
      setError("Answer at least one question.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/c/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", answers: nonEmpty }),
      });

      const body = await res.json().catch(() => ({ error: "Something went wrong" }));

      if (!res.ok) {
        setError(body.error ?? "Something went wrong");
        router.refresh();
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "estimate") {
    return (
      <div className="space-y-4">
        <textarea
          className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-[#e6e6f2]"
          placeholder="Add a note (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-ember-500">{success}</p> : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void submitEstimate("approve")}
            disabled={submitting}
            className="bg-ember-500 hover:bg-ember-600 text-[#0a0a0f] font-semibold px-6 py-3 rounded-xl ember-glow transition"
          >
            Approve estimate
          </button>
          <button
            type="button"
            onClick={() => void submitEstimate("decline")}
            disabled={submitting}
            className="bg-dark-600 px-6 py-3 rounded-xl text-[#e6e6f2] font-semibold"
          >
            Decline
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitAnswers} className="space-y-4">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium">{q.text}</label>
          <textarea
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-[#e6e6f2]"
            value={answers[q.id] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
            disabled={submitting}
          />
        </div>
      ))}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="bg-ember-500 hover:bg-ember-600 text-[#0a0a0f] font-semibold px-6 py-3 rounded-xl ember-glow transition"
      >
        Send answers
      </button>
    </form>
  );
}

