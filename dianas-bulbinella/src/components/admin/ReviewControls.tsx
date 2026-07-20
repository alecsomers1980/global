"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  status: string;
  staffReply: string;
};

export default function ReviewControls({ id, status, staffReply }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState(staffReply);

  const send = async (action: string, body?: Record<string, unknown>) => {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setReplying(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setConfirmDelete(false);
    } finally {
      setLoading(null);
    }
  };

  const btn =
    "text-xs rounded-full px-3 py-1.5 border transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex flex-wrap gap-1.5 justify-end">
        {status !== "approved" && (
          <button
            onClick={() => send("approved", { status: "approved" })}
            disabled={loading !== null}
            className={`${btn} border-forest text-forest hover:bg-forest hover:text-paper`}
          >
            {loading === "approved" ? "…" : "Approve"}
          </button>
        )}
        {status !== "hidden" && (
          <button
            onClick={() => send("hidden", { status: "hidden" })}
            disabled={loading !== null}
            className={`${btn} border-line text-muted hover:bg-black/5`}
          >
            {loading === "hidden" ? "…" : "Hide"}
          </button>
        )}
        <button
          onClick={() => setReplying((v) => !v)}
          disabled={loading !== null}
          className={`${btn} border-line text-muted hover:bg-black/5`}
        >
          {staffReply ? "Edit reply" : "Reply"}
        </button>
        <button
          onClick={() => (confirmDelete ? send("delete") : setConfirmDelete(true))}
          disabled={loading !== null}
          className={`${btn} border-red-300 text-red-600 hover:bg-red-50`}
        >
          {loading === "delete" ? "…" : confirmDelete ? "Sure?" : "Delete"}
        </button>
      </div>

      {replying && (
        <div className="w-full max-w-md">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Diana's public reply to this review…"
            className="w-full rounded-lg border border-line p-2 text-sm"
          />
          <button
            onClick={() => send("reply", { staffReply: reply })}
            disabled={loading !== null}
            className={`${btn} mt-1 border-forest text-forest hover:bg-forest hover:text-paper`}
          >
            {loading === "reply" ? "Saving…" : "Save reply"}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
