import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../../../_lib";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<{
      kind?: string;
      label?: string;
      url?: string;
      status?: string;
      notes?: string;
    }>(req);

    if (!payload.kind || !payload.label) {
      return NextResponse.json({ error: "kind and label are required" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      client_id: id,
      kind: payload.kind,
      label: payload.label,
    };
    if (payload.url !== undefined) insert.url = payload.url;
    if (payload.status !== undefined) insert.status = payload.status;
    if (payload.notes !== undefined) insert.notes = payload.notes;

    const { data: asset, error } = await db
      .from("client_assets")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ asset });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const rowId = req.nextUrl.searchParams.get("rowId");
    if (!rowId) {
      return NextResponse.json({ error: "rowId is required" }, { status: 400 });
    }

    const payload = await json<{
      status?: string;
      url?: string;
      notes?: string;
      checked_at?: string;
    }>(req);

    const update: Record<string, unknown> = {};
    if (payload.status !== undefined) update.status = payload.status;
    if (payload.url !== undefined) update.url = payload.url;
    if (payload.notes !== undefined) update.notes = payload.notes;
    if (payload.checked_at !== undefined) update.checked_at = payload.checked_at;

    const { data: asset, error } = await db
      .from("client_assets")
      .update(update)
      .eq("id", rowId)
      .eq("client_id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ asset });
  } catch (e) {
    return errorResponse(e);
  }
}

