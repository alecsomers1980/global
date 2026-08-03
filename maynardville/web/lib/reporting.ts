import { isPreview, mockSalesVsCompReport } from "./mock-data";

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
  if (isPreview()) return mockSalesVsCompReport;
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