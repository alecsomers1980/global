import { syncPerformancesFromQuicket } from "@/lib/quicket-sync";
import { getStaffFromRequest } from "@/lib/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const staff = getStaffFromRequest(req);
  const isAdmin = staff?.role === "Admin";

  if (!isCron && !isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const eventId = process.env.QUICKET_EVENT_ID;
  if (!eventId) {
    return NextResponse.json(
      { ok: false, error: "QUICKET_EVENT_ID not configured" },
      { status: 400 },
    );
  }

  const season = process.env.CURRENT_SEASON || "2026";

  try {
    const summary = await syncPerformancesFromQuicket(eventId, season);
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}