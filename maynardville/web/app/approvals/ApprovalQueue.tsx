"use client";

import { useState } from "react";
import { CompRequestRow } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { Loader2 } from "lucide-react";

function ApprovalCard({
  row,
  onProcessed,
}: {
  row: CompRequestRow;
  onProcessed: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Approval failed");
      }
      onProcessed(row.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDecline = async () => {
    if (!declineReason.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", reason: declineReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Decline failed");
      }
      onProcessed(row.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[3px] border border-mv-line bg-white p-4 space-y-3 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-heading font-semibold text-lg text-mv-navy">
            {row.guestName} {row.guestSurname}
          </h3>
          <p className="text-sm text-mv-navy-muted">{row.performance}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-mv-navy-muted">
        <p>
          <span className="font-medium">Category:</span> {row.category}
        </p>
        <p>
          <span className="font-medium">Requester:</span> {row.requester}
        </p>
        <p>
          <span className="font-medium">Seats:</span> {row.totalSeats}
          {row.houseSeats && (
            <span className="ml-2 inline-block bg-mv-mint text-mv-navy rounded-[3px] px-1.5 py-0.5 text-xs font-bold">
              HOUSE SEATS
            </span>
          )}
        </p>
        {row.notes && (
          <p>
            <span className="font-medium">Notes:</span> {row.notes}
          </p>
        )}
        <p className="col-span-full text-xs text-mv-navy-muted">
          Submitted: {new Date(row.submittedAt).toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-[3px] px-3 py-1">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 rounded-[3px] bg-mv-blue text-white font-medium hover:bg-mv-navy disabled:opacity-60 inline-flex items-center gap-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Processing..." : "Approve"}
        </button>

        {!declineOpen ? (
          <button
            onClick={() => setDeclineOpen(true)}
            disabled={loading}
            className="px-4 py-2 rounded-[3px] border border-red-500 text-red-600 font-medium hover:bg-red-50 disabled:opacity-60"
          >
            Decline
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Reason for decline"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="rounded-[3px] border border-mv-line bg-white text-mv-navy placeholder:text-mv-navy-muted px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-mv-blue/40 focus:border-mv-blue"
              disabled={loading}
            />
            <button
              onClick={confirmDecline}
              disabled={loading || !declineReason.trim()}
              className="px-4 py-2 rounded-[3px] bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60 inline-flex items-center gap-1"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Decline
            </button>
            <button
              onClick={() => {
                setDeclineOpen(false);
                setDeclineReason("");
              }}
              disabled={loading}
              className="text-sm underline text-mv-navy-muted hover:text-mv-navy"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApprovalQueue({ rows: initialRows }: { rows: CompRequestRow[] }) {
  const [rows, setRows] = useState<CompRequestRow[]>(initialRows);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProcessed = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSuccessMessage("Request processed successfully.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        {successMessage && (
          <div className="bg-mv-mint text-mv-navy px-4 py-2 rounded-[3px] inline-block text-sm font-medium">
            {successMessage}
          </div>
        )}
        <div className="rounded-[3px] bg-white border border-mv-line shadow-card p-6 max-w-md mx-auto">
          <p className="text-lg font-heading font-semibold text-mv-navy">
            All requests processed
          </p>
          <p className="text-sm text-mv-navy-muted mt-1">
            There are no pending comp requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="bg-mv-mint text-mv-navy px-4 py-2 rounded-[3px] text-sm font-medium mb-2">
          {successMessage}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {rows.map((row) => (
          <ApprovalCard key={row.id} row={row} onProcessed={handleProcessed} />
        ))}
      </div>
    </div>
  );
}