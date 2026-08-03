import { NextResponse } from "next/server";
import { listCompRequestRows } from "@/lib/comps";
import { notifyMissingData } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await listCompRequestRows(["ISSUED"]);
    const missing = rows.filter(r => !r.seatNumbers || !r.ticketReference);

    const items = missing.map(r => ({
      id: r.id,
      guest: `${r.guestName} ${r.guestSurname}`,
      performance: r.performance,
      seatNumbers: r.seatNumbers ?? "",
      ticketReference: r.ticketReference ?? "",
    }));

    await notifyMissingData(items);

    return NextResponse.json({ ok: true, count: missing.length });
  } catch (error) {
    console.error("Missing data notification job failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}