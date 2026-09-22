import { NextResponse } from "next/server";
import { runMonthlyGrant } from "@/lib/spine/grant";
import { serviceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("x-cron-secret");
  const auth = req.headers.get("authorization");

  const ok = !!secret && (header === secret || auth === `Bearer ${secret}`);

  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMonthlyGrant(serviceClient());
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

