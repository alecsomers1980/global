import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { ReportPeriod } from "./period";

/**
 * Website traffic from the GA4 Data API.
 *
 * A service account, not OAuth: Everest's OAuth refresh token died every
 * seven days while its Google app sat in Testing mode, and a monthly cron
 * always found it dead. A service-account key does not expire.
 *
 * Never throws. Any failure comes back as { available: false } with the
 * reason, and the report prints one line in place of the section.
 */

export type Row = { label: string; value: number };

export type TrafficMetrics =
  | {
      available: true;
      sessions: number;
      users: number;
      newUsers: number;
      pageViews: number;
      engagementRate: number;
      pages: Row[];
      channels: Row[];
      devices: Row[];
      countries: Row[];
      /** "2026-09-14" when the first session fell after the 1st, else null. */
      trackingStarted: string | null;
    }
  | { available: false; reason: string };

function client(): { ga: BetaAnalyticsDataClient; property: string } {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON;
  // Trimmed of a BOM as well as whitespace: Everest lost a month to a
  // zero-width character in front of the property ID in Vercel.
  const id = process.env.GA4_PROPERTY_ID?.replace(/^﻿/, "").trim();
  if (!raw || !id) throw new Error("GA_SERVICE_ACCOUNT_JSON / GA4_PROPERTY_ID not set");
  if (!/^\d+$/.test(id)) throw new Error(`GA4_PROPERTY_ID must be the numeric ID, got "${id}"`);
  const key = JSON.parse(raw) as { client_email: string; private_key: string };
  return {
    ga: new BetaAnalyticsDataClient({
      credentials: { client_email: key.client_email, private_key: key.private_key },
    }),
    property: `properties/${id}`,
  };
}

export async function fetchTraffic(period: ReportPeriod): Promise<TrafficMetrics> {
  try {
    const { ga, property } = client();
    const dateRanges = [{ startDate: period.startDate, endDate: period.endDate }];

    const rows = async (dimension: string, metric: string, limit?: number): Promise<Row[]> => {
      const [res] = await ga.runReport({
        property,
        dateRanges,
        dimensions: [{ name: dimension }],
        metrics: [{ name: metric }],
        orderBys: [{ metric: { metricName: metric }, desc: true }],
        ...(limit ? { limit } : {}),
      });
      return (res.rows ?? []).map((r) => ({
        label: r.dimensionValues?.[0]?.value ?? "",
        value: Number(r.metricValues?.[0]?.value ?? 0),
      }));
    };

    const [[totals], pages, channels, devices, countries, [first]] = await Promise.all([
      ga.runReport({
        property,
        dateRanges,
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "screenPageViews" },
          { name: "engagementRate" },
        ],
      }),
      rows("pagePath", "screenPageViews", 10),
      rows("sessionDefaultChannelGroup", "sessions"),
      rows("deviceCategory", "sessions"),
      rows("country", "sessions", 5),
      ga.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 1,
      }),
    ]);

    const t = totals.rows?.[0]?.metricValues?.map((v) => Number(v.value ?? 0)) ?? [0, 0, 0, 0, 0];
    const firstDay = first.rows?.[0]?.dimensionValues?.[0]?.value; // "20260914"
    const firstIso = firstDay ? `${firstDay.slice(0, 4)}-${firstDay.slice(4, 6)}-${firstDay.slice(6, 8)}` : null;

    return {
      available: true,
      sessions: t[0],
      users: t[1],
      newUsers: t[2],
      pageViews: t[3],
      engagementRate: t[4],
      pages,
      channels,
      devices,
      countries,
      trackingStarted: firstIso && firstIso > period.startDate ? firstIso : null,
    };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    console.error(`[report ${period.key}] GA4 unavailable:`, reason);
    return { available: false, reason };
  }
}
