===FILE: lib/reporting.ts===
```typescript
export interface SalesVsCompRow {
  performanceId: string;
  performance: string;
  date: string;
  capacity: number;
  ticketsSold: number;
  gross: number;
  compsIssued: number;
  compsPipeline: number;
  totalAllocated: number;
  utilisationPct: number | null;
  remaining: number | null;
}

export interface SalesVsCompReport {
  rows: SalesVsCompRow[];
  totals: SalesVsCompRow;
}

function env() {
  return {
    apiKey: process.env.AIRTABLE_API_KEY!,
    baseId: process.env.AIRTABLE_BASE_ID!,
  };
}

async function aFetchAll(table: string): Promise<any[]> {
  const { apiKey, baseId } = env();
  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
  let url = `${baseUrl}?pageSize=100`;
  const all: any[] = [];

  while (true) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    all.push(...data.records);
    if (!data.offset) break;
    url = `${baseUrl}?pageSize=100&offset=${encodeURIComponent(data.offset)}`;
  }

  return all;
}

export async function getSalesVsComp(): Promise<SalesVsCompReport> {
  try {
    const [performances, sales, comps] = await Promise.all([
      aFetchAll("Performances"),
      aFetchAll("Quicket Sales"),
      aFetchAll("Comp Requests"),
    ]);

    const perfMap: Record<
      string,
      { label: string; date: string; capacity: number }
    > = {};

    for (const rec of performances) {
      const f = rec.fields;
      const id = rec.id;
      perfMap[id] = {
        label: f["Performance Label"] || f["Production/Event"] || "Untitled",
        date: f["Date"] || "",
        capacity: Number(f["Capacity"]) || 0,
      };
    }

    const salesByPerf: Record<string, { ticketsSold: number; gross: number }> = {};
    for (const rec of sales) {
      const perfId = rec.fields["Performance"]?.[0];
      if (!perfId) continue;
      const qty = Number(rec.fields["Quantity Sold"]) || 0;
      const price = Number(rec.fields["Price"]) || 0;
      const acc = salesByPerf[perfId] || { ticketsSold: 0, gross: 0 };
      acc.ticketsSold += qty;
      acc.gross += price * qty;
      salesByPerf[perfId] = acc;
    }

    const compsByPerf: Record<string, { compsIssued: number; compsPipeline: number }> = {};
    for (const rec of comps) {
      const perfId = rec.fields["Performance"]?.[0];
      if (!perfId) continue;
      const seats = Number(rec.fields["Total Seats Requested"]) || 0;
      const status = rec.fields["Ticket Status"];
      const acc = compsByPerf[perfId] || { compsIssued: 0, compsPipeline: 0 };

      if (status === "ISSUED") {
        acc.compsIssued += seats;
      } else if (
        !["DECLINED", "CANCELLED", "DUPLICATE/ERROR"].includes(status)
      ) {
        acc.compsPipeline += seats;
      }
      compsByPerf[perfId] = acc;
    }

    const rows: SalesVsCompRow[] = [];

    for (const [perfId, perf] of Object.entries(perfMap)) {
      const sale = salesByPerf[perfId] || { ticketsSold: 0, gross: 0 };
      const comp = compsByPerf[perfId] || { compsIssued: 0, compsPipeline: 0 };
      const ticketsSold = sale.ticketsSold;
      const gross = sale.gross;
      const compsIssued = comp.compsIssued;
      const compsPipeline = comp.compsPipeline;
      const totalAllocated = ticketsSold + compsIssued;
      const capacity = perf.capacity;

      const utilisationPct =
        capacity > 0 ? Math.round((totalAllocated / capacity) * 100) : null;
      const remaining = capacity > 0 ? capacity - totalAllocated : null;

      rows.push({
        performanceId: perfId,
        performance: perf.label,
        date: perf.date,
        capacity,
        ticketsSold,
        gross,
        compsIssued,
        compsPipeline,
        totalAllocated,
        utilisationPct,
        remaining,
      });
    }

    rows.sort((a, b) => {
      if (a.date === "" && b.date === "") return 0;
      if (a.date === "") return 1;
      if (b.date === "") return -1;
      return a.date.localeCompare(b.date);
    });

    const totals: SalesVsCompRow = {
      performanceId: "",
      performance: "Total",
      date: "",
      capacity: 0,
      ticketsSold: 0,
      gross: 0,
      compsIssued: 0,
      compsPipeline: 0,
      totalAllocated: 0,
      utilisationPct: null,
      remaining: null,
    };

    for (const row of rows) {
      totals.capacity += row.capacity;
      totals.ticketsSold += row.ticketsSold;
      totals.gross += row.gross;
      totals.compsIssued += row.compsIssued;
      totals.compsPipeline += row.compsPipeline;
      totals.totalAllocated += row.totalAllocated;
    }

    totals.utilisationPct =
      totals.capacity > 0
        ? Math.round((totals.totalAllocated / totals.capacity) * 100)
        : null;
    totals.remaining =
      totals.capacity > 0 ? totals.capacity - totals.totalAllocated : null;

    return { rows, totals };
  } catch (error) {
    const zeroRow: SalesVsCompRow = {
      performanceId: "",
      performance: "Total",
      date: "",
      capacity: 0,
      ticketsSold: 0,
      gross: 0,
      compsIssued: 0,
      compsPipeline: 0,
      totalAllocated: 0,
      utilisationPct: null,
      remaining: null,
    };
    return { rows: [], totals: zeroRow };
  }
}
```
===END===
===FILE: components/reports/ExportCsvButton.tsx===
```tsx
"use client";

import React from "react";

interface ExportCsvButtonProps {
  rows: any[];
  filename: string;
}

export default function ExportCsvButton({ rows, filename }: ExportCsvButtonProps) {
  const handleExport = () => {
    const headers = [
      "Performance",
      "Date",
      "Capacity",
      "Tickets Sold",
      "Gross",
      "Comps Issued",
      "Total Allocated",
      "% of Capacity",
      "Remaining",
    ];

    const escapeCsv = (value: any): string => {
      const str = value == null ? "" : String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = rows.map((row) =>
      [
        row.performance,
        row.date,
        row.capacity,
        row.ticketsSold,
        row.gross,
        row.compsIssued,
        row.totalAllocated,
        row.utilisationPct != null ? row.utilisationPct : "",
        row.remaining != null ? row.remaining : "",
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-mv-blue text-white rounded-[3px] px-4 py-2 text-sm font-medium hover:bg-mv-navy-muted transition-colors"
    >
      Export CSV
    </button>
  );
}
```
===END===
===FILE: app/reports/page.tsx===
```tsx
import { requireStaff } from "@/lib/session";
import { getSalesVsComp } from "@/lib/reporting";
import ExportCsvButton from "@/components/reports/ExportCsvButton";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const staff = await requireStaff(["Admin"]);
  const report = await getSalesVsComp();

  return (
    <div className="min-h-screen bg-mv-cream font-sans">
      {/* Header */}
      <header className="bg-mv-navy text-white py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-[3px] mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-heading font-bold">Maynardville</h1>
          <span className="text-lg font-heading">Sales vs Comp Report</span>
        </div>
        <div className="flex gap-4 mt-2 sm:mt-0 text-sm">
          <a href="/dashboard" className="hover:text-mv-mint transition-colors">
            ← Dashboard
          </a>
          <a href="/api/auth/logout" className="hover:text-mv-mint transition-colors">
            Sign out
          </a>
        </div>
      </header>

      <main className="px-6 pb-10">
        {/* Caption */}
        <p className="text-sm text-gray-600 mb-4 max-w-2xl">
          Sales figures accumulate from Quicket as purchases sync. Figures may be empty before go‑live.
        </p>

        <div className="mb-6">
          <ExportCsvButton rows={report.rows} filename="maynardville-sales-vs-comp.csv" />
        </div>

        {report.rows.length === 0 ? (
          <div className="bg-white rounded-[3px] border border-gray-200 p-8 text-center">
            <p className="text-gray-700 font-semibold">
              No performance data yet.
            </p>
            <p className="text-gray-600 mt-2">
              Performances populate from the Quicket sync, and sales accumulate as purchases come through.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[3px] border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-mv-navy-muted text-white font-heading">
                <tr>
                  <th className="text-left px-4 py-3">Performance</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Capacity</th>
                  <th className="text-right px-4 py-3">Tickets Sold</th>
                  <th className="text-right px-4 py-3">Gross</th>
                  <th className="text-right px-4 py-3">Comps Issued</th>
                  <th className="text-right px-4 py-3">Total Allocated</th>
                  <th className="text-right px-4 py-3">% of Capacity</th>
                  <th className="text-right px-4 py-3">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.performanceId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.performance}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-right">{row.capacity}</td>
                    <td className="px-4 py-3 text-right">{row.ticketsSold}</td>
                    <td className="px-4 py-3 text-right">
                      R{Math.round(row.gross).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">{row.compsIssued}</td>
                    <td className="px-4 py-3 text-right">{row.totalAllocated}</td>
                    <td className="px-4 py-3 text-right">
                      {row.utilisationPct === null
                        ? "—"
                        : `${row.utilisationPct}%`}
                      {row.utilisationPct !== null && row.utilisationPct >= 100 && (
                        <span className="text-red-600"> (full)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.remaining === null ? "—" : row.remaining}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-mv-navy text-white font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right">{report.totals.capacity}</td>
                  <td className="px-4 py-3 text-right">{report.totals.ticketsSold}</td>
                  <td className="px-4 py-3 text-right">
                    R{Math.round(report.totals.gross).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{report.totals.compsIssued}</td>
                  <td className="px-4 py-3 text-right">{report.totals.totalAllocated}</td>
                  <td className="px-4 py-3 text-right">
                    {report.totals.utilisationPct === null
                      ? "—"
                      : `${report.totals.utilisationPct}%`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {report.totals.remaining === null ? "—" : report.totals.remaining}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
```
===END===