/**
 * GA4 Data API module — fetches website traffic metrics for the monthly report.
 *
 * Returns { available, totals, channels, topPages, devices, geo } for curr/prev
 * date ranges, or { available: false, error } if credentials are missing or the
 * API call fails.
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { OAuth2Client } from "google-auth-library";

// Service-account access to GA4 is broken by a Google-side bug (~Apr 2026), so we
// authenticate via OAuth using the existing OAuth client + the property owner's own
// GA access. See scripts/get-ga-oauth-token.mjs for minting GA_OAUTH_REFRESH_TOKEN.
function getClient() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GA_OAUTH_REFRESH_TOKEN;
  if (!propertyId || !clientId || !clientSecret || !refreshToken) return null;

  const authClient = new OAuth2Client(clientId, clientSecret);
  authClient.setCredentials({ refresh_token: refreshToken });

  return {
    client: new BetaAnalyticsDataClient({ authClient }),
    property: `properties/${propertyId}`,
  };
}

/**
 * Run a report for a single date range. Returns rows as plain objects.
 */
async function runSingleRange(client, property, start, end, { dimensions, metrics, limit }) {
  const payload = {
    property,
    dateRanges: [{ startDate: start, endDate: end }],
    metrics: metrics.map((name) => ({ name })),
  };
  if (dimensions && dimensions.length) {
    payload.dimensions = dimensions.map((name) => ({ name }));
  }
  if (limit) payload.limit = limit;

  const [resp] = await client.runReport(payload);
  return resp;
}

function extractTotals(response) {
  const rv = {};
  const values = response.rows?.[0]?.metricValues || [];
  (response.metricHeaders || []).forEach((header, i) => {
    rv[header.name] = values[i]?.value || "0";
  });
  return rv;
}

function extractDimensionRows(response, dimName) {
  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "(none)",
    value: row.metricValues?.[0]?.value || "0",
  }));
}

function extractGeoRows(response) {
  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "(unknown)",
    sessions: row.metricValues?.[0]?.value || "0",
  }));
}

function extractChannelRows(response) {
  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "(none)",
    sessions: row.metricValues?.[0]?.value || "0",
    users: row.metricValues?.[1]?.value || "0",
  }));
}

export async function fetchGaReport({ curr, prev }) {
  const ctx = getClient();
  if (!ctx) {
    return { available: false, error: "GA4 credentials not configured" };
  }

  const { client, property } = ctx;

  try {
    // Totals (single call per range — metrics don't need dimensions)
    const [currTotalsResp, prevTotalsResp] = await Promise.all([
      runSingleRange(client, property, curr.start, curr.end, {
        metrics: [
          "totalUsers",
          "newUsers",
          "sessions",
          "screenPageViews",
          "averageSessionDuration",
          "bounceRate",
          "engagementRate",
        ],
      }),
      runSingleRange(client, property, prev.start, prev.end, {
        metrics: [
          "totalUsers",
          "newUsers",
          "sessions",
          "screenPageViews",
          "averageSessionDuration",
          "bounceRate",
          "engagementRate",
        ],
      }),
    ]);

    // Acquisition (channels) — one call per range
    const [currChannelsResp, prevChannelsResp] = await Promise.all([
      runSingleRange(client, property, curr.start, curr.end, {
        dimensions: ["sessionDefaultChannelGroup"],
        metrics: ["sessions", "totalUsers"],
      }),
      runSingleRange(client, property, prev.start, prev.end, {
        dimensions: ["sessionDefaultChannelGroup"],
        metrics: ["sessions", "totalUsers"],
      }),
    ]);

    // Top pages
    const [currPagesResp] = await Promise.all([
      runSingleRange(client, property, curr.start, curr.end, {
        dimensions: ["pagePath"],
        metrics: ["screenPageViews"],
        limit: 10,
      }),
    ]);

    // Devices
    const [currDevicesResp, prevDevicesResp] = await Promise.all([
      runSingleRange(client, property, curr.start, curr.end, {
        dimensions: ["deviceCategory"],
        metrics: ["sessions"],
      }),
      runSingleRange(client, property, prev.start, prev.end, {
        dimensions: ["deviceCategory"],
        metrics: ["sessions"],
      }),
    ]);

    // Geo
    const [currGeoResp] = await Promise.all([
      runSingleRange(client, property, curr.start, curr.end, {
        dimensions: ["city"],
        metrics: ["sessions"],
        limit: 10,
      }),
    ]);

    // Build the channels table — merge curr + prev by channel name
    const prevChannelsMap = {};
    for (const ch of extractChannelRows(prevChannelsResp)) {
      prevChannelsMap[ch.name] = ch;
    }
    const channels = extractChannelRows(currChannelsResp).map((ch) => ({
      name: ch.name,
      currentSessions: Number(ch.sessions) || 0,
      previousSessions: Number(prevChannelsMap[ch.name]?.sessions) || 0,
    }));
    // Add channels only present in prev but not curr
    for (const [name, pch] of Object.entries(prevChannelsMap)) {
      if (!channels.find((c) => c.name === name)) {
        channels.push({
          name,
          currentSessions: 0,
          previousSessions: Number(pch.sessions) || 0,
        });
      }
    }

    // Build devices table
    const prevDevicesMap = {};
    for (const d of extractDimensionRows(prevDevicesResp, "deviceCategory")) {
      prevDevicesMap[d.name] = d;
    }
    const devices = extractDimensionRows(currDevicesResp, "deviceCategory").map((d) => ({
      name: d.name,
      sessions: Number(d.value) || 0,
      previousSessions: Number(prevDevicesMap[d.name]?.value) || 0,
    }));

    return {
      available: true,
      totals: {
        current: extractTotals(currTotalsResp),
        previous: extractTotals(prevTotalsResp),
      },
      channels,
      topPages: extractDimensionRows(currPagesResp, "pagePath").map((p) => ({
        path: p.name,
        views: Number(p.value) || 0,
      })),
      devices,
      geo: extractGeoRows(currGeoResp),
    };
  } catch (err) {
    console.error("[reports/ga] GA4 API error:", err);
    return { available: false, error: err.message || "GA4 API error" };
  }
}
