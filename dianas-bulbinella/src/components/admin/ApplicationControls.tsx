"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  id: string;
  status: string;
  dealerId: string | null;
};

export default function ApplicationControls({ id, status, dealerId }: Props) {
  const router = useRouter();
  type Action = "approved" | "declined" | "pending" | "delete";
  const [loading, setLoading] = useState<Action | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchStatus = async (newStatus: "approved" | "declined" | "pending") => {
    setLoading(newStatus);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dealer-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Patch failed");

      if (newStatus === "approved" && data.dealerId) {
        router.push(`/admin/dealers/${data.dealerId}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading("delete");
    setError(null);
    try {
      const res = await fetch(`/api/admin/dealer-applications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setConfirmDelete(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "pending" && (
        <>
          <button
            onClick={() => patchStatus("approved")}
            disabled={!!loading}
            className="rounded-full bg-forest text-paper px-4 py-1.5 text-sm font-medium hover:bg-moss disabled:opacity-50"
          >
            {loading === "approved" ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={() => patchStatus("declined")}
            disabled={!!loading}
            className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface-2 disabled:opacity-50"
          >
            {loading === "declined" ? "Declining…" : "Decline"}
          </button>
        </>
      )}

      {status !== "pending" && (
        <>
          <span className="text-sm font-medium text-ink">
            {status === "approved" ? "Approved" : "Declined"}
          </span>
          <button
            onClick={() => patchStatus("pending")}
            disabled={!!loading}
            className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface-2 disabled:opacity-50"
          >
            {loading === "pending" ? "Moving…" : "Move back to pending"}
          </button>
          {dealerId && (
            <Link
              href={`/admin/dealers/${dealerId}`}
              className="text-sm text-forest hover:underline"
            >
              View dealer
            </Link>
          )}
        </>
      )}

      <div>
        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="text-sm text-red-600 hover:underline"
        >
          {confirmDelete ? (loading === "delete" ? "Deleting…" : "Yes, delete") : "Delete"}
        </button>
        {confirmDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
            className="text-sm text-muted hover:text-ink ml-2"
          >
            Cancel
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 w-full">{error}</p>}
    </div>
  );
}
