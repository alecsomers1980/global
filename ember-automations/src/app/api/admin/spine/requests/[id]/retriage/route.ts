import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse } from "../../../_lib";
import { triageAndQueue } from "@/lib/spine/triageRun";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = serviceClient();
    const { outboxId } = await triageAndQueue(db, id);
    return NextResponse.json({ outboxId });
  } catch (e) {
    return errorResponse(e);
  }
}

