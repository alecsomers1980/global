import { previousMonth } from "@/lib/reports/period";
import { runReport } from "@/lib/reports/build";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Runs on the 1st at 06:00 UTC (08:00 SAST) — see vercel.json. Vercel sends
 * CRON_SECRET as a bearer token on scheduled calls; anything else is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const period = previousMonth();
  try {
    const result = await runReport(period, { ai: process.env.REPORT_AI_SUMMARY === "on", email: true });
    console.log(`[report ${period.key}]`, JSON.stringify(result));
    return Response.json(result);
  } catch (e) {
    console.error(`[report ${period.key}] failed`, e);
    return Response.json({ month: period.key, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
