import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../_lib";
import { buildReport } from "@/lib/reports/build";

// Generating a report waits on one AI call; the cron does the same work unattended.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const db = serviceClient();
    const clientId = req.nextUrl.searchParams.get("client_id");

    let query = db.from("reports").select("*").order("period", { ascending: false });
    if (clientId) query = query.eq("client_id", clientId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ reports: data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { client_id, period } = await json<{ client_id?: string; period?: string }>(req);
    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const result = await buildReport(serviceClient(), client_id, period);
    return NextResponse.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
