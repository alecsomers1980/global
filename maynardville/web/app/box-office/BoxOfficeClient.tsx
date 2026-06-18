"use client";

import { useState } from "react";
import { CompRequestRow } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { Loader2 } from "lucide-react";

function ToIssueCard({
  row,
  onIssued,
}: {
  row: CompRequestRow;
  onIssued: (id: string) => void;
}) {
  const [seatNumbers, setSeatNumbers] = useState("");
  const [ticketReference, setTicketReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canIssue = seatNumbers.trim() !== "" && ticketReference.trim() !== "";

  const handleIssue = async () => {
    if (!canIssue) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          seatNumbers: seatNumbers.trim(),
          ticketReference: ticketReference.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Issuing failed");
      }
      onIssued(row.id);
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-mv-navy-muted">Seat Numbers</label>
          <input
            type="text"
            value={seatNumbers}
            onChange={(e) => setSeatNumbers(e.target.value)}
            placeholder="e.g. A12-14"
            className="w-full rounded-[3px] border border-mv-line bg-white text-mv-navy placeholder:text-mv-navy-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mv-blue/40 focus:border-mv-blue"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-mv-navy-muted">Ticket Reference</label>
          <input
            type="text"
            value={ticketReference}
            onChange={(e) => setTicketReference(e.target.value)}
            placeholder="REF-1234"
            className="w-full rounded-[3px] border border-mv-line bg-white text-mv-navy placeholder:text-mv-navy-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mv-blue/40 focus:border-mv-blue"
          />
        </div>
      </div>

      {!canIssue && seatNumbers === "" && ticketReference === "" && (
        <p className="text-xs text-mv-navy-muted">
          Enter both seat numbers and ticket reference to issue.
        </p>
      )}
      {!canIssue && (seatNumbers === "" || ticketReference === "") && (
        <p className="text-xs text-mv-navy-muted">
          Both fields are required.
        </p>
      )}
      {error && (
        <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-[3px] px-3 py-1">
          {error}
        </div>
      )}

      <button
        onClick={handleIssue}
        disabled={!canIssue || loading}
        className="w-full sm:w-auto px-5 py-2 rounded-[3px] bg-mv-mint text-mv-navy font-semibold hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Issue Tickets
      </button>
    </div>
  );
}

export default function BoxOfficeClient({
  toIssue,
  issued,
}: {
  toIssue: CompRequestRow[];
  issued: CompRequestRow[];
}) {
  const [tab, setTab] = useState<"toissue" | "issued">("toissue");
  const [toIssueList, setToIssueList] = useState<CompRequestRow[]>(toIssue);
  const [issuedList, setIssuedList] = useState<CompRequestRow[]>(issued);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleIssued = (id: string) => {
    const row = toIssueList.find((r) => r.id === id);
    setToIssueList((prev) => prev.filter((r) => r.id !== id));
    if (row) {
      setIssuedList((prev) => [
        ...prev,
        { ...row, status: "ISSUED" as const, seatNumbers: "", ticketReference: "" }, // placeholder; server will have updated it
      ]);
    }
    setSuccessMessage("Tickets issued successfully.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div>
      <div className="flex border-b border-mv-line mb-6">
        <button
          onClick={() => setTab("toissue")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "toissue"
              ? "border-mv-mint text-mv-navy"
              : "border-transparent text-mv-navy-muted hover:text-mv-navy"
          }`}
        >
          To Issue ({toIssueList.length})
        </button>
        <button
          onClick={() => setTab("issued")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "issued"
              ? "border-mv-mint text-mv-navy"
              : "border-transparent text-mv-navy-muted hover:text-mv-navy"
          }`}
        >
          Full Comps List ({issuedList.length})
        </button>
      </div>

      {successMessage && (
        <div className="bg-mv-mint text-mv-navy px-4 py-2 rounded-[3px] text-sm font-medium mb-4">
          {successMessage}
        </div>
      )}

      {tab === "toissue" && (
        <div>
          {toIssueList.length === 0 ? (
            <p className="text-center py-12 text-mv-navy-muted">
              No tickets waiting to be issued.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {toIssueList.map((row) => (
                <ToIssueCard key={row.id} row={row} onIssued={handleIssued} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "issued" && (
        <div>
          {issuedList.length === 0 ? (
            <p className="text-center py-12 text-mv-navy-muted">
              No issued comps yet.
            </p>
          ) : (
            <>
              <p className="text-xs text-mv-navy-muted mb-3">
                Editing locked to Jaco & Wessel
              </p>
              <div className="overflow-x-auto border border-mv-line rounded shadow-card bg-white">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-mv-line text-left text-mv-navy-muted bg-mv-canvas">
                      <th className="py-2 px-3 font-medium">Guest</th>
                      <th className="py-2 px-3 font-medium">Performance</th>
                      <th className="py-2 px-3 font-medium">Category</th>
                      <th className="py-2 px-3 font-medium">Requester</th>
                      <th className="py-2 px-3 font-medium">Seats</th>
                      <th className="py-2 px-3 font-medium">Seat Numbers</th>
                      <th className="py-2 px-3 font-medium">Ticket Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedList.map((row) => (
                      <tr key={row.id} className="border-b border-mv-line">
                        <td className="py-2 px-3 text-mv-navy">
                          {row.guestName} {row.guestSurname}
                        </td>
                        <td className="py-2 px-3 text-mv-navy">{row.performance}</td>
                        <td className="py-2 px-3 text-mv-navy">{row.category}</td>
                        <td className="py-2 px-3 text-mv-navy">{row.requester}</td>
                        <td className="py-2 px-3 text-mv-navy">{row.totalSeats}</td>
                        <td className="py-2 px-3 text-mv-navy">{row.seatNumbers || "—"}</td>
                        <td className="py-2 px-3 text-mv-navy">{row.ticketReference || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="block sm:hidden mt-4 space-y-3">
                {issuedList.map((row) => (
                  <div
                    key={row.id}
                    className="border border-mv-line rounded-[3px] p-3 bg-white shadow-card"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {row.guestName} {row.guestSurname}
                      </span>
                      <span className="text-xs text-mv-blue">
                        {row.performance}
                      </span>
                    </div>
                    <div className="text-xs mt-1 space-y-0.5">
                      <p>Category: {row.category}</p>
                      <p>Requester: {row.requester}</p>
                      <p>Seats: {row.totalSeats}</p>
                      <p>Seat Numbers: {row.seatNumbers || "—"}</p>
                      <p>Ticket Ref: {row.ticketReference || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="sm:hidden text-xs text-mv-navy-muted mt-3">
                Editing locked to Jaco & Wessel
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}