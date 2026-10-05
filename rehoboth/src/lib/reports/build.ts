import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getServerClient } from "../supabase/server";
import { monthBefore, type ReportPeriod } from "./period";
import { fetchShopMetrics } from "./shop";
import { fetchTraffic } from "./ga";
import { writeSummary } from "./summary";
import { emailReport } from "./email";
import { MonthlyReport, type ReportData } from "./MonthlyReport";

export const REPORTS_BUCKET = "reports";
export const storagePath = (month: string) => `${month}.pdf`;

/** Gathers the figures and renders the PDF. Stores and sends nothing. */
export async function buildReport(period: ReportPeriod, opts: { ai: boolean }) {
  const db = getServerClient();
  const before = monthBefore(period);

  const [shop, previous, traffic, previousTraffic] = await Promise.all([
    fetchShopMetrics(db, period),
    fetchShopMetrics(db, before),
    fetchTraffic(period),
    fetchTraffic(before),
  ]);

  const summary = opts.ai
    ? await writeSummary(
        { thisMonth: shop, lastMonth: previous, traffic: traffic.available ? traffic : "unavailable" },
        period.label
      )
    : null;

  const data: ReportData = {
    period,
    generatedAt: new Date().toISOString(),
    shop,
    previous,
    traffic,
    previousTraffic,
    summary,
  };
  // createElement rather than JSX so this stays a .ts module.
  const pdf = await renderToBuffer(createElement(MonthlyReport, { data }) as Parameters<typeof renderToBuffer>[0]);
  return { pdf, data };
}

export type RunResult = {
  month: string;
  stored: boolean;
  emailed: string[];
  gaAvailable: boolean;
  aiIncluded: boolean;
  errors: string[];
};

/**
 * build → store → (optionally) email. Regenerating a month replaces its file
 * and its row; there is never a second copy of the same month.
 */
export async function runReport(period: ReportPeriod, opts: { ai: boolean; email: boolean }): Promise<RunResult> {
  const db = getServerClient();
  const { pdf, data } = await buildReport(period, opts);
  const errors: string[] = [];

  const { error: upload } = await db.storage
    .from(REPORTS_BUCKET)
    .upload(storagePath(period.key), pdf, { contentType: "application/pdf", upsert: true });
  if (upload) throw new Error(`Report upload failed: ${upload.message}`);

  let emailed: string[] = [];
  let emailError: string | null = null;
  if (opts.email) {
    try {
      emailed = await emailReport(period, pdf);
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e);
      errors.push(`email: ${emailError}`);
    }
  }
  if (!data.traffic.available) errors.push(`ga: ${data.traffic.reason}`);

  const { error: row } = await db.from("monthly_reports").upsert({
    month: period.key,
    storage_path: storagePath(period.key),
    generated_at: data.generatedAt,
    emailed_to: emailed,
    email_error: emailError,
    ga_available: data.traffic.available,
    ai_included: data.summary !== null,
  });
  if (row) throw new Error(`Report row failed: ${row.message}`);

  return {
    month: period.key,
    stored: true,
    emailed,
    gaAvailable: data.traffic.available,
    aiIncluded: data.summary !== null,
    errors,
  };
}

/** Emails a report already in storage, and records the outcome on its row. */
export async function sendStoredReport(period: ReportPeriod): Promise<string[]> {
  const db = getServerClient();
  const { data: file, error } = await db.storage.from(REPORTS_BUCKET).download(storagePath(period.key));
  if (error || !file) throw new Error(`No stored report for ${period.label}`);

  try {
    const emailed = await emailReport(period, Buffer.from(await file.arrayBuffer()));
    await db.from("monthly_reports").update({ emailed_to: emailed, email_error: null }).eq("month", period.key);
    return emailed;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.from("monthly_reports").update({ email_error: message }).eq("month", period.key);
    throw new Error(`Email failed: ${message}`);
  }
}
