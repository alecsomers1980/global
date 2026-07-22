import { NextResponse } from "next/server";

/**
 * Lightweight health check for external uptime monitoring (e.g. UptimeRobot,
 * Better Uptime). Reports whether required env vars are present without
 * leaking their values.
 *
 * Forced dynamic: without this, Next statically optimizes a param-less GET
 * handler at build time, freezing `time` and the env check at build-time values
 * instead of evaluating them on each request — useless for live monitoring.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
  };

  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    checks,
  });
}
