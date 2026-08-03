===FILE: lib/dashboard.ts===
import { listCompRequestRows } from "./comps";
import type { CompRequestRow } from "./types";

const ALL_STATUSES = [
  "REQUEST",
  "TO APPROVE",
  "APPROVED",
  "TO ISSUE",
  "ISSUED",
  "DECLINED",
  "CANCELLED",
  "DUPLICATE/ERROR",
];

function normalizeCat(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface Breakdown {
  name: string;
  count: number;
  seats: number;
}

export interface DashboardData {
  totals: {
    totalRequests: number;
    pending: number;
    toIssue: number;
    issued: number;
    declined: number;
    cancelled: number;
    seatsRequested: number;
    seatsIssued: number;
  };
  byCategory: Breakdown[];
  byPerformance: Breakdown[];
  byRequester: Breakdown[];
  houseSeats: {
    count: number;
    seats: number;
  };
  alerts: CompRequestRow[];
  rows: CompRequestRow[];
}

export interface SalesRow {
  performance: string;
  tickets: number;
  gross: number;
}

export async function getCompDashboard(categoryNames?: string[]): Promise<DashboardData> {
  let rows = await listCompRequestRows(ALL_STATUSES);

  if (categoryNames && categoryNames.length) {
    const allow = new Set(categoryNames.map(normalizeCat));
    rows = rows.filter((r) => allow.has(normalizeCat(r.category)));
  }

  const totals = {
    totalRequests: rows.length,
    pending: rows.filter(
      (r) => r.status === "REQUEST" || r.status === "TO APPROVE" || r.status === "APPROVED"
    ).length,
    toIssue: rows.filter((r) => r.status === "TO ISSUE").length,
    issued: rows.filter((r) => r.status === "ISSUED").length,
    declined: rows.filter((r) => r.status === "DECLINED").length,
    cancelled: rows.filter((r) => r.status === "CANCELLED").length,
    seatsRequested: rows.reduce((sum, r) => sum + (r.totalSeats || 0), 0),
    seatsIssued: rows
      .filter((r) => r.status === "ISSUED")
      .reduce((sum, r) => sum + (r.totalSeats || 0), 0),
  };

  const groupBy = <K extends keyof CompRequestRow>(
    key: K
  ): Breakdown[] => {
    const map = new Map<string, { count: number; seats: number }>();
    for (const row of rows) {
      const val = row[key] as string | undefined | null;
      if (!val || val.trim() === "") continue;
      const name = val.trim();
      const entry = map.get(name) || { count: 0, seats: 0 };
      entry.count += 1;
      entry.seats += row.totalSeats || 0;
      map.set(name, entry);
    }
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count);
  };

  const byCategory = groupBy("category");
  const byPerformance = groupBy("performance");
  const byRequester = groupBy("requester");

  const houseSeatsRows = rows.filter((r) => r.houseSeats === true);
  const houseSeats = {
    count: houseSeatsRows.length,
    seats: houseSeatsRows.reduce((sum, r) => sum + (r.totalSeats || 0), 0),
  };

  const alerts = rows.filter(
    (r) => r.status === "ISSUED" && (!r.seatNumbers || !r.ticketReference)
  );

  return {
    totals,
    byCategory,
    byPerformance,
    byRequester,
    houseSeats,
    alerts,
    rows,
  };
}

export async function getSalesSummary(): Promise<SalesRow[]> {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!baseId || !apiKey) return [];

    const fetchAll = async (tableName: string): Promise<any[]> => {
      let records: any[] = [];
      let offset: string | undefined = undefined;
      do {
        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?pageSize=100${offset ? `&offset=${offset}` : ""}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`Airtable error: ${res.statusText}`);
        const data = await res.json();
        records = records.concat(data.records);
        offset = data.offset;
      } while (offset);
      return records;
    };

    const performances = await fetchAll("Performances");
    const perfMap = new Map<string, string>();
    for (const rec of performances) {
      const f = rec.fields || {};
      const name = f["Performance Label"] || f["Production/Event"] || "Unnamed";
      perfMap.set(rec.id, name);
    }

    const quicketSales = await fetchAll("Quicket Sales");
    const salesByPerf = new Map<string, { tickets: number; gross: number }>();

    for (const rec of quicketSales) {
      const f = rec.fields || {};
      const perfId = f.Performance?.[0] as string | undefined;
      const perfName = perfId && perfMap.has(perfId) ? perfMap.get(perfId)! : "Unassigned";
      const qty = Number(f["Quantity Sold"]) || 0;
      const price = Number(f.Price) || 0;
      const gross = price * qty;

      const current = salesByPerf.get(perfName) || { tickets: 0, gross: 0 };
      current.tickets += qty;
      current.gross += gross;
      salesByPerf.set(perfName, current);
    }

    return Array.from(salesByPerf.entries())
      .map(([performance, stats]) => ({ performance, ...stats }))
      .sort((a, b) => b.gross - a.gross);
  } catch {
    return [];
  }
}
===END===
===FILE: components/dashboard/StatCard.tsx===
interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "navy" | "blue" | "mint";
}

const accentColors = {
  navy: "border-l-mv-navy",
  blue: "border-l-mv-blue",
  mint: "border-l-mv-mint",
} as const;

export default function StatCard({
  label,
  value,
  hint,
  accent = "navy",
}: StatCardProps) {
  return (
    <div
      className={`bg-white border rounded-[3px] p-4 shadow-sm border-l-4 ${accentColors[accent]}`}
    >
      <div className="uppercase text-xs tracking-wide text-mv-navy-muted mb-1 font-heading">
        {label}
      </div>
      <div className="text-2xl font-bold text-mv-navy font-heading">
        {value}
      </div>
      {hint && (
        <div className="text-sm text-mv-navy-muted mt-1">{hint}</div>
      )}
    </div>
  );
}
===END===
===FILE: components/dashboard/BreakdownList.tsx===
import type { Breakdown } from "@/lib/dashboard";

interface BreakdownListProps {
  title: string;
  items: Breakdown[];
}

export default function BreakdownList({ title, items }: BreakdownListProps) {
  const maxCount = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="bg-white border rounded-[3px] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-mv-navy font-heading mb-4">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-mv-navy-muted">No data yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const pct = Math.max(2, (item.count / maxCount) * 100);
            return (
              <li key={item.name} className="flex items-center gap-3">
                <span className="text-sm font-medium truncate w-24 sm:w-28 text-mv-navy">
                  {item.name}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded">
                  <div
                    className="h-full bg-mv-blue rounded"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-mv-navy-muted whitespace-nowrap">
                  {item.count} reqs · {item.seats} seats
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
===END===
===FILE: components/dashboard/AlertsPanel.tsx===
import type { CompRequestRow } from "@/lib/types";

interface AlertsPanelProps {
  alerts: CompRequestRow[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-white border rounded-[3px] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-mv-navy font-heading mb-4">
        Action needed
      </h3>

      {alerts.length === 0 ? (
        <div className="text-mv-mint font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          All good — no outstanding issues.
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="pl-3 border-l-2 border-amber-400"
            >
              <p className="text-sm text-mv-navy">
                <span className="font-medium">
                  {alert.guestName} {alert.guestSurname}
                </span>{" "}
                — {alert.performance} —{" "}
                <span className="text-amber-700">
                  missing seat numbers/ticket reference
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
===END===
===FILE: components/dashboard/CompTable.tsx===
import type { CompRequestRow } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

interface CompTableProps {
  rows: CompRequestRow[];
  caption?: string;
}

export default function CompTable({ rows, caption }: CompTableProps) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border rounded-[3px] p-6 shadow-sm text-center text-sm text-mv-navy-muted">
        No requests.
      </div>
    );
  }

  return (
    <div>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          {caption && (
            <caption className="text-left text-lg font-semibold text-mv-navy font-heading mb-4">
              {caption}
            </caption>
          )}
          <thead className="bg-mv-cream text-mv-navy text-left">
            <tr>
              <th className="px-4 py-3 font-heading font-semibold">Guest</th>
              <th className="px-4 py-3 font-heading font-semibold">Performance</th>
              <th className="px-4 py-3 font-heading font-semibold">Category</th>
              <th className="px-4 py-3 font-heading font-semibold">Requester</th>
              <th className="px-4 py-3 font-heading font-semibold">Seats</th>
              <th className="px-4 py-3 font-heading font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{row.guestName} {row.guestSurname}</td>
                <td className="px-4 py-3">{row.performance}</td>
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3">{row.requester}</td>
                <td className="px-4 py-3">{row.totalSeats}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-4">
        {caption && (
          <h3 className="text-lg font-semibold text-mv-navy font-heading mb-4">
            {caption}
          </h3>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white border rounded-[3px] p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between">
              <span className="font-medium text-mv-navy">Guest</span>
              <span>{row.guestName} {row.guestSurname}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-mv-navy">Performance</span>
              <span>{row.performance}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-mv-navy">Category</span>
              <span>{row.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-mv-navy">Requester</span>
              <span>{row.requester}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-mv-navy">Seats</span>
              <span>{row.totalSeats}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-mv-navy">Status</span>
              <StatusBadge status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
===END===
===FILE: components/dashboard/DepartmentDashboard.tsx===
import type { DashboardData } from "@/lib/dashboard";
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
    <div className="min-h-screen bg-gray-50">
      {/* Branded header bar */}
      <header className="bg-mv-navy text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-heading font-bold text-lg tracking-wide">
              Comp Manager
            </span>
            <span className="hidden sm:inline text-mv-cream">|</span>
            <span className="font-heading text-base font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Signed in as {staffName}</span>
            <a
              href="/api/auth/logout"
              className="underline hover:text-mv-mint transition-colors"
            >
              Sign out
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* StatCards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard label="Total requests" value={data.totals.totalRequests} />
          <StatCard label="Pending" value={data.totals.pending} accent="blue" />
          <StatCard label="To issue" value={data.totals.toIssue} />
          <StatCard label="Issued" value={data.totals.issued} accent="mint" />
          <StatCard label="Declined" value={data.totals.declined} />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BreakdownList
            title="By Performance"
            items={data.byPerformance}
          />
          <BreakdownList title="By Requester" items={data.byRequester} />
        </div>

        {/* Alerts */}
        <AlertsPanel alerts={data.alerts} />

        {/* CompTable */}
        <CompTable rows={data.rows} caption="All Requests" />
      </main>
    </div>
  );
}
===END===