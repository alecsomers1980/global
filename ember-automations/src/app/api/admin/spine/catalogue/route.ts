import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../_lib";

export async function GET() {
  try {
    const db = serviceClient();
    const { data: items, error } = await db
      .from("catalogue_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ items });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = serviceClient();
    const payload = await json<{
      name?: string;
      description?: string;
      size?: string;
      verticals?: string[];
      active?: boolean;
      sort_order?: number;
    }>(req);

    if (!payload.name || !payload.size || !["S", "M", "L"].includes(payload.size)) {
      return NextResponse.json(
        { error: "name is required and size must be S, M, or L" },
        { status: 400 },
      );
    }

    const insert: Record<string, unknown> = {
      name: payload.name,
      size: payload.size,
    };
    if (payload.description !== undefined) insert.description = payload.description;
    if (payload.verticals !== undefined) insert.verticals = payload.verticals;
    if (payload.active !== undefined) insert.active = payload.active;
    if (payload.sort_order !== undefined) insert.sort_order = payload.sort_order;

    const { data: item, error } = await db
      .from("catalogue_items")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ item });
  } catch (e) {
    return errorResponse(e);
  }
}

