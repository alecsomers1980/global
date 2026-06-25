import { NextResponse } from "next/server";
import { fetchGaReport } from "@/lib/reports/ga";
import { getMonthWindows } from "@/lib/reports/period";

export const runtime = "nodejs";

// TEMPORARY diagnostic — returns only presence booleans + GA availability (no
// secret values, no analytics data beyond a session count). Remove after use.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("key") !== "diag7f3a") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const env = {
    hasPropertyId: !!process.env.GA4_PROPERTY_ID,
    propertyIdLen: (process.env.GA4_PROPERTY_ID || "").length,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasRefreshToken: !!process.env.GA_OAUTH_REFRESH_TOKEN,
    refreshTokenLen: (process.env.GA_OAUTH_REFRESH_TOKEN || "").length,
  };
  const { curr, prev } = getMonthWindows("2026-06");
  const r = await fetchGaReport({ curr, prev });
  return NextResponse.json({
    env,
    gaAvailable: r.available,
    gaError: r.error || null,
    sessions: r.totals?.current?.sessions ?? null,
  });
}
