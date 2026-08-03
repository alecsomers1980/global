===FILE: app/api/requests/[id]/route.ts===
import { NextResponse } from "next/server";
import { getStaffFromRequest } from "@/lib/session";
import { approveRequest, declineRequest, issueRequest } from "@/lib/comps";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const staff = getStaffFromRequest(req);
    if (!staff) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { action, reason, seatNumbers, ticketReference } = await req.json();

    if (action === "approve") {
      if (staff.role !== "Admin") {
        return NextResponse.json(
          { message: "Only Admin can approve requests" },
          { status: 403 }
        );
      }
      await approveRequest(params.id, staff.name);
      return NextResponse.json({ ok: true });
    }

    if (action === "decline") {
      if (staff.role !== "Admin") {
        return NextResponse.json(
          { message: "Only Admin can decline requests" },
          { status: 403 }
        );
      }
      if (!reason || reason.trim() === "") {
        return NextResponse.json(
          { message: "Decline reason is required" },
          { status: 400 }
        );
      }
      await declineRequest(params.id, staff.name, reason.trim());
      return NextResponse.json({ ok: true });
    }

    if (action === "issue") {
      if (staff.role !== "Box Office" && staff.role !== "Admin") {
        return NextResponse.json(
          { message: "Insufficient permissions" },
          { status: 403 }
        );
      }
      if (
        !seatNumbers ||
        !ticketReference ||
        seatNumbers.trim() === "" ||
        ticketReference.trim() === ""
      ) {
        return NextResponse.json(
          { message: "Seat numbers and ticket reference are required" },
          { status: 400 }
        );
      }
      await issueRequest(
        params.id,
        staff.name,
        seatNumbers.trim(),
        ticketReference.trim()
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { message: "Unknown action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
===END===
===FILE: components/StatusBadge.tsx===
"use client";

import { CompRequestRow } from "@/lib/types";

const statusStyles: Record<string, string> = {
  REQUEST: "bg-[#3D4067] text-[#FFFADB]",
  "TO ISSUE": "bg-[#0F3193] text-[#FFFADB]",
  ISSUED: "bg-[#62DAA9] text-[#060A3C]",
  DECLINED: "bg-red-600 text-white",
};

export default function StatusBadge({ status }: { status: CompRequestRow["status"] }) {
  const colors = statusStyles[status] || "bg-gray-200 text-gray-700";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-[3px] ${colors}`}
    >
      {status}
    </span>
  );
}
===END===
===FILE: app/approvals/page.tsx===
import { requireStaff } from "@/lib/session";
import { listCompRequestRows } from "@/lib/comps";
import ApprovalQueue from "./ApprovalQueue";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const staff = requireStaff(["Admin"]);
  const rows = await listCompRequestRows(["REQUEST"]);

  return (
    <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0F3193]/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-bold">Maynardville</h1>
          <p className="text-sm text-[#FFFADB]/70">Approvals</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#62DAA9]">{staff.name} ({staff.role})</span>
          <Link
            href="/api/staff-login"
            className="underline underline-offset-2 hover:text-[#62DAA9] transition-colors"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ApprovalQueue rows={rows} />
      </main>
    </div>
  );
}
===END===
===FILE: app/approvals/ApprovalQueue.tsx===
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
          {row.houseSeats && row.houseSeats > 0 && (
            <span className="ml-2 inline-block bg-[#62DAA9] text-[#060A3C] rounded-[3px] px-1.5 py-0.5 text-xs font-bold">
              HOUSE {row.houseSeats}
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
===END===
===FILE: app/box-office/page.tsx===
import { requireStaff } from "@/lib/session";
import { listCompRequestRows } from "@/lib/comps";
import BoxOfficeClient from "./BoxOfficeClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BoxOfficePage() {
  const staff = requireStaff(["Box Office", "Admin"]);
  const toIssue = await listCompRequestRows(["TO ISSUE"]);
  const issued = await listCompRequestRows(["ISSUED"]);

  return (
    <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB]">
      <header className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0F3193]/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-bold">Maynardville</h1>
          <p className="text-sm text-[#FFFADB]/70">Box Office</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#62DAA9]">{staff.name} ({staff.role})</span>
          <Link
            href="/api/staff-login"
            className="underline underline-offset-2 hover:text-[#62DAA9] transition-colors"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <BoxOfficeClient toIssue={toIssue} issued={issued} />
      </main>
    </div>
  );
}
===END===
===FILE: app/box-office/BoxOfficeClient.tsx===
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
          {row.houseSeats && row.houseSeats > 0 && (
            <span className="ml-2 inline-block bg-[#62DAA9] text-[#060A3C] rounded-[3px] px-1.5 py-0.5 text-xs font-bold">
              HOUSE {row.houseSeats}
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
===END===
===FILE: app/dashboard/page.tsx===
import Link from "next/link";
import { getStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const staff = getStaffSession();

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-heading font-bold">Maynardville</h1>
          <p className="text-lg text-[#FFFADB]/70">
            Staff Comp‑Ticket Portal
          </p>
          <Link
            href="/staff-login"
            className="inline-block rounded-[3px] bg-[#0F3193] hover:bg-[#0F3193]/90 text-white font-medium px-6 py-3 transition-colors"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB]">
      <header className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0F3193]/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-bold">Maynardville</h1>
          <p className="text-sm text-[#FFFADB]/70">Staff Dashboard</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#62DAA9]">
            Signed in as {staff.name} ({staff.role})
          </span>
          <Link
            href="/api/staff-login"
            className="underline underline-offset-2 hover:text-[#62DAA9] transition-colors"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.role === "Admin" && (
            <Link
              href="/approvals"
              className="group rounded-[3px] border border-[#3D4067] bg-[#060A3C] hover:border-[#0F3193] hover:bg-[#0F3193]/10 p-6 transition-all"
            >
              <h2 className="text-xl font-heading font-semibold group-hover:text-[#62DAA9]">
                Approvals
              </h2>
              <p className="text-sm text-[#FFFADB]/60 mt-2">
                Review and approve comp requests
              </p>
            </Link>
          )}

          {(staff.role === "Box Office" || staff.role === "Admin") && (
            <Link
              href="/box-office"
              className="group rounded-[3px] border border-[#3D4067] bg-[#060A3C] hover:border-[#0F3193] hover:bg-[#0F3193]/10 p-6 transition-all"
            >
              <h2 className="text-xl font-heading font-semibold group-hover:text-[#62DAA9]">
                Box Office
              </h2>
              <p className="text-sm text-[#FFFADB]/60 mt-2">
                Issue tickets and view comps
              </p>
            </Link>
          )}

          {["PR/Media", "Sponsorship", "Operations", "Leadership"].map(
            (label) => (
              <div
                key={label}
                className="rounded-[3px] border border-[#3D4067] bg-[#060A3C] opacity-60 p-6"
              >
                <h2 className="text-xl font-heading font-semibold text-[#FFFADB]/50">
                  {label}
                </h2>
                <p className="text-sm text-[#FFFADB]/30 mt-2">Coming soon</p>
              </div>
            )
          )}
        </div>

        {/* TODO: Replace staff auth with Auth.js when ready */}
      </main>
    </div>
  );
}
===END===