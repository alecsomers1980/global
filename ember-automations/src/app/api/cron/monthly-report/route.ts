import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { buildReportsForAllClients } from "@/lib/reports/build";

export const dynamic = "force-dynamic";
// Every client's report means one AI call each, run in sequence.
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("x-cron-secret");
  const auth = req.headers.get("authorization");

  const ok = !!secret && (header === secret || auth === `Bearer ${secret}`);

  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const results = await buildReportsForAllClients(serviceClient());
    return NextResponse.json({ generated: results.filter((r) => !r.skipped).length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
