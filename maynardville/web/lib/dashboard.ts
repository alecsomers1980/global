import { listCompRequestRows } from "./comps";
import type { CompRequestRow } from "./types";
import { isPreview, mockSalesSummary } from "./mock-data";

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
  if (isPreview()) return mockSalesSummary;
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!baseId || !apiKey) return [];

    const fetchAll = async (tableName: string): Promise<any[]> => {
      let records: any[] = [];
      let offset: string | undefined = undefined;
      do {
        const url: string = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?pageSize=100${offset ? `&offset=${offset}` : ""}`;
        const res: Response = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`Airtable error: ${res.statusText}`);
        const data: any = await res.json();
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