===FILE: components/StatusBadge.tsx===
import type { CompRequestRow } from "@/lib/types";

const statusStyles: Record<CompRequestRow["status"], string> = {
  REQUEST: "bg-mv-navy-muted text-mv-cream",
  "TO ISSUE": "bg-mv-blue text-mv-cream",
  ISSUED: "bg-mv-mint text-mv-navy",
  DECLINED: "bg-red-500 text-white",
  CANCELLED: "bg-gray-300 text-mv-navy",
  "DUPLICATE/ERROR": "bg-amber-400 text-mv-navy",
};

export default function StatusBadge({ status }: { status: CompRequestRow["status"] }) {
  const classes = statusStyles[status] ?? "bg-mv-line text-mv-navy";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${classes}`}
    >
      {status}
    </span>
  );
}
===END===
===FILE: components/dashboard/StatCard.tsx===
const accentMap = {
  navy: "bg-mv-navy",
  blue: "bg-mv-blue",
  mint: "bg-mv-mint",
};

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "navy" | "blue" | "mint";
}

export default function StatCard({ label, value, hint, accent = "navy" }: StatCardProps) {
  const barClass = accentMap[accent] ?? accentMap.navy;

  return (
    <div className="relative overflow-hidden border border-mv-line rounded shadow-card p-5">
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t ${barClass}`} />
      <div className="uppercase text-[11px] tracking-wide text-mv-navy-muted">{label}</div>
      <div className="font-heading text-3xl text-mv-navy mt-1">{value}</div>
      {hint && <div className="text-xs text-mv-navy-muted mt-1">{hint}</div>}
    </div>
  );
}
===END===
===FILE: components/dashboard/BreakdownList.tsx===
interface BreakdownItem {
  name: string;
  count: number;
  seats: number;
}

interface BreakdownListProps {
  title: string;
  items: BreakdownItem[];
}

export default function BreakdownList({ title, items }: BreakdownListProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="border border-mv-line rounded shadow-card p-5">
      <h3 className="font-heading text-mv-navy text-sm uppercase tracking-wide mb-4">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-mv-navy-muted">No data yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-mv-navy truncate">{item.name}</span>
                <span className="text-xs text-mv-navy-muted shrink-0 ml-2">
                  {item.count} · {item.seats} seats
                </span>
              </div>
              <div className="w-full h-1.5 bg-mv-line rounded-full">
                <div
                  className="h-full bg-mv-blue rounded-full"
                  style={{
                    width: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
===END===
===FILE: components/dashboard/AlertsPanel.tsx===
import type { CompRequestRow } from "@/lib/types";
import { CheckCircle } from "lucide-react";

interface AlertsPanelProps {
  alerts: CompRequestRow[];
}

function missingMessage(row: CompRequestRow) {
  const missing: string[] = [];
  if (!row.seatNumbers || row.seatNumbers.length === 0) missing.push("seat numbers");
  if (!row.ticketReference) missing.push("ticket reference");
  if (missing.length === 0) return null;
  return `Missing ${missing.join(" & ")}`;
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="border-l-4 border-amber-400 rounded shadow-card p-5 bg-white">
      <h3 className="font-heading text-mv-navy text-lg mb-3">Action needed</h3>

      {alerts.length === 0 ? (
        <div className="flex items-center text-mv-navy">
          <CheckCircle className="w-4 h-4 text-mv-mint mr-1.5" />
          <span>All good — no outstanding issues.</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((row) => {
            const msg = missingMessage(row);
            return (
              <li key={row.id} className="flex flex-wrap items-baseline py-1 border-b border-mv-line last:border-0">
                <span className="font-semibold text-mv-navy">
                  {row.guestName} {row.guestSurname}
                </span>
                <span className="text-mv-navy-muted ml-1">— {row.performance}</span>
                {msg && <span className="text-amber-600 text-xs ml-2">{msg}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
===END===
===FILE: components/dashboard/CompTable.tsx===
import type { CompRequestRow } from "@/lib/types";
import StatusBadge from "../StatusBadge";

interface CompTableProps {
  rows: CompRequestRow[];
  caption?: string;
}

export default function CompTable({ rows, caption }: CompTableProps) {
  return (
    <div className="border border-mv-line rounded shadow-card overflow-hidden bg-white">
      {caption && (
        <div className="px-5 py-3 border-b border-mv-line font-heading text-sm text-mv-navy">
          {caption}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-6 text-sm text-mv-navy-muted">No requests.</div>
      ) : (
        <>
          {/* Mobile stacked cards */}
          <div className="sm:hidden divide-y divide-mv-line">
            {rows.map((row) => (
              <div key={row.id} className="p-4 space-y-2 text-sm">
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Guest</span>
                  <p className="text-mv-navy">{row.guestName} {row.guestSurname}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Performance</span>
                  <p className="text-mv-navy">{row.performance}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Category</span>
                  <p className="text-mv-navy">{row.category}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Requester</span>
                  <p className="text-mv-navy">{row.requester}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Seats</span>
                  <p className="text-mv-navy">{row.totalSeats}</p>
                </div>
                <div>
                  <span className="text-mv-navy-muted text-xs uppercase">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={row.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-mv-canvas text-[11px] uppercase tracking-wide text-mv-navy-muted">
                  <th className="px-4 py-2.5 text-left font-medium">Guest</th>
                  <th className="px-4 py-2.5 text-left font-medium">Performance</th>
                  <th className="px-4 py-2.5 text-left font-medium">Category</th>
                  <th className="px-4 py-2.5 text-left font-medium">Requester</th>
                  <th className="px-4 py-2.5 text-right font-medium">Seats</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-mv-line hover:bg-mv-canvas/60 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-sm text-mv-navy">
                      {row.guestName} {row.guestSurname}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy">{row.performance}</td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy">{row.category}</td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy">{row.requester}</td>
                    <td className="px-4 py-2.5 text-sm text-mv-navy text-right">
                      {row.totalSeats}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
===END===
===FILE: components/dashboard/DepartmentDashboard.tsx===
import type { DashboardData } from "@/lib/dashboard";
import AppHeader from "@/components/ui/AppHeader";
import StatCard from "./StatCard";
import BreakdownList from "./BreakdownList";
import AlertsPanel from "./AlertsPanel";
import CompTable from "./CompTable";

interface DepartmentDashboardProps {
  title: string;
  staffName: string;
  data: DashboardData;
}

export default function DepartmentDashboard({
  title,
  staffName,
  data,
}: DepartmentDashboardProps) {
  return (
    <div className="min-h-screen bg-mv-canvas">
      <AppHeader title={title} staffName={staffName} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-up space-y-8">
        {/* Stat cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total requests" value={data.totals.totalRequests} />
          <StatCard label="Pending" value={data.totals.pending} accent="navy" />
          <StatCard label="To issue" value={data.totals.toIssue} accent="blue" />
          <StatCard label="Issued" value={data.totals.issued} accent="mint" />
          <StatCard label="Declined" value={data.totals.declined} />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreakdownList title="By performance" items={data.byPerformance} />
          <BreakdownList title="By requester" items={data.byRequester} />
        </div>

        {/* Alerts */}
        <AlertsPanel alerts={data.alerts} />

        {/* Requests table */}
        <CompTable rows={data.rows} caption="Requests" />
      </main>
    </div>
  );
}
===END===