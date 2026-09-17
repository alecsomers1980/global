import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../../_lib";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<{
      name?: string;
      description?: string;
      size?: string;
      verticals?: string[];
      active?: boolean;
      sort_order?: number;
    }>(req);

    const update: Record<string, unknown> = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.description !== undefined) update.description = payload.description;
    if (payload.size !== undefined) {
      if (!["S", "M", "L"].includes(payload.size)) {
        return NextResponse.json({ error: "size must be S, M, or L" }, { status: 400 });
      }
      update.size = payload.size;
    }
    if (payload.verticals !== undefined) update.verticals = payload.verticals;
    if (payload.active !== undefined) update.active = payload.active;
    if (payload.sort_order !== undefined) update.sort_order = payload.sort_order;

    const { data: item, error } = await db
      .from("catalogue_items")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ item });
  } catch (e) {
    return errorResponse(e);
  }
}

