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
    <div className="rounded-[3px] border border-[#3D4067] bg-[#060A3C] p-4 space-y-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-heading font-semibold text-lg">
            {row.guestName} {row.guestSurname}
          </h3>
          <p className="text-sm text-[#FFFADB]/70">{row.performance}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-[#FFFADB]/80">
        <p>
          <span className="font-medium">Category:</span> {row.category}
        </p>
        <p>
          <span className="font-medium">Requester:</span> {row.requester}
        </p>
        <p>
          <span className="font-medium">Seats:</span> {row.totalSeats}
          {row.houseSeats && (
            <span className="ml-2 inline-block bg-[#62DAA9] text-[#060A3C] rounded-[3px] px-1.5 py-0.5 text-xs font-bold">
              HOUSE SEATS
            </span>
          )}
        </p>
        {row.notes && (
          <p>
            <span className="font-medium">Notes:</span> {row.notes}
          </p>
        )}
        <p className="col-span-full text-xs text-[#FFFADB]/50">
          Submitted: {new Date(row.submittedAt).toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/30 rounded-[3px] px-3 py-1">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 rounded-[3px] bg-[#0F3193] text-white font-medium hover:bg-[#0F3193]/90 disabled:opacity-60 inline-flex items-center gap-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Processing..." : "Approve"}
        </button>

        {!declineOpen ? (
          <button
            onClick={() => setDeclineOpen(true)}
            disabled={loading}
            className="px-4 py-2 rounded-[3px] border border-red-500 text-red-400 font-medium hover:bg-red-500/10 disabled:opacity-60"
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
              className="rounded-[3px] border border-[#3D4067] bg-[#060A3C] text-[#FFFADB] px-3 py-1.5 text-sm w-64"
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
              className="text-sm underline text-[#FFFADB]/70 hover:text-[#FFFADB]"
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
          <div className="bg-[#62DAA9] text-[#060A3C] px-4 py-2 rounded-[3px] inline-block text-sm font-medium">
            {successMessage}
          </div>
        )}
        <div className="rounded-[3px] bg-[#0F3193]/10 border border-[#0F3193] p-6 max-w-md mx-auto">
          <p className="text-lg font-heading font-semibold text-[#62DAA9]">
            All requests processed
          </p>
          <p className="text-sm text-[#FFFADB]/70 mt-1">
            There are no pending comp requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="bg-[#62DAA9] text-[#060A3C] px-4 py-2 rounded-[3px] text-sm font-medium mb-2">
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