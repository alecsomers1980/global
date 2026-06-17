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
    <div className="rounded-[3px] border border-[#3D4067] bg-[#060A3C] p-4 space-y-3">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Seat Numbers</label>
          <input
            type="text"
            value={seatNumbers}
            onChange={(e) => setSeatNumbers(e.target.value)}
            placeholder="e.g. A12-14"
            className="w-full rounded-[3px] border border-[#62DAA9] bg-[#060A3C] text-[#FFFADB] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#62DAA9]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Ticket Reference</label>
          <input
            type="text"
            value={ticketReference}
            onChange={(e) => setTicketReference(e.target.value)}
            placeholder="REF-1234"
            className="w-full rounded-[3px] border border-[#62DAA9] bg-[#060A3C] text-[#FFFADB] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#62DAA9]"
          />
        </div>
      </div>

      {!canIssue && seatNumbers === "" && ticketReference === "" && (
        <p className="text-xs text-[#FFFADB]/50">
          Enter both seat numbers and ticket reference to issue.
        </p>
      )}
      {!canIssue && (seatNumbers === "" || ticketReference === "") && (
        <p className="text-xs text-[#FFFADB]/50">
          Both fields are required.
        </p>
      )}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/30 rounded-[3px] px-3 py-1">
          {error}
        </div>
      )}

      <button
        onClick={handleIssue}
        disabled={!canIssue || loading}
        className="w-full sm:w-auto px-5 py-2 rounded-[3px] bg-[#62DAA9] text-[#060A3C] font-semibold hover:bg-[#62DAA9]/90 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1"
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
      <div className="flex border-b border-[#3D4067] mb-6">
        <button
          onClick={() => setTab("toissue")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "toissue"
              ? "border-[#62DAA9] text-[#62DAA9]"
              : "border-transparent text-[#FFFADB]/70 hover:text-white"
          }`}
        >
          To Issue ({toIssueList.length})
        </button>
        <button
          onClick={() => setTab("issued")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "issued"
              ? "border-[#62DAA9] text-[#62DAA9]"
              : "border-transparent text-[#FFFADB]/70 hover:text-white"
          }`}
        >
          Full Comps List ({issuedList.length})
        </button>
      </div>

      {successMessage && (
        <div className="bg-[#62DAA9] text-[#060A3C] px-4 py-2 rounded-[3px] text-sm font-medium mb-4">
          {successMessage}
        </div>
      )}

      {tab === "toissue" && (
        <div>
          {toIssueList.length === 0 ? (
            <p className="text-center py-12 text-[#FFFADB]/60">
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
            <p className="text-center py-12 text-[#FFFADB]/60">
              No issued comps yet.
            </p>
          ) : (
            <>
              <p className="text-xs text-[#FFFADB]/50 mb-3">
                Editing locked to Jaco & Wessel
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#3D4067] text-left text-[#FFFADB]/70">
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
                      <tr key={row.id} className="border-b border-[#3D4067]/50">
                        <td className="py-2 px-3">
                          {row.guestName} {row.guestSurname}
                        </td>
                        <td className="py-2 px-3">{row.performance}</td>
                        <td className="py-2 px-3">{row.category}</td>
                        <td className="py-2 px-3">{row.requester}</td>
                        <td className="py-2 px-3">{row.totalSeats}</td>
                        <td className="py-2 px-3">{row.seatNumbers || "—"}</td>
                        <td className="py-2 px-3">{row.ticketReference || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="block sm:hidden mt-4 space-y-3">
                {issuedList.map((row) => (
                  <div
                    key={row.id}
                    className="border border-[#3D4067] rounded-[3px] p-3 bg-[#060A3C]"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {row.guestName} {row.guestSurname}
                      </span>
                      <span className="text-xs text-[#62DAA9]">
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
              <p className="sm:hidden text-xs text-[#FFFADB]/50 mt-3">
                Editing locked to Jaco & Wessel
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}