import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse } from "../_lib";
import { listPending } from "@/lib/spine/outbox";

export async function GET(_req: NextRequest) {
  try {
    const db = serviceClient();
    const items = await listPending(db);
    return NextResponse.json({ items });
  } catch (e) {
    return errorResponse(e);
  }
}

