import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../../../_lib";

type PersonInput = {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  signs_off_on?: string[];
  is_primary?: boolean;
  notes?: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<PersonInput>(req);

    if (!payload.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const insert: Record<string, unknown> = { client_id: id, name: payload.name };
    if (payload.role !== undefined) insert.role = payload.role;
    if (payload.email !== undefined) insert.email = payload.email;
    if (payload.phone !== undefined) insert.phone = payload.phone;
    if (payload.signs_off_on !== undefined) insert.signs_off_on = payload.signs_off_on;
    if (payload.is_primary !== undefined) insert.is_primary = payload.is_primary;
    if (payload.notes !== undefined) insert.notes = payload.notes;

    const { data: person, error } = await db
      .from("client_people")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ person });
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

    const payload = await json<PersonInput>(req);

    const update: Record<string, unknown> = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.role !== undefined) update.role = payload.role;
    if (payload.email !== undefined) update.email = payload.email;
    if (payload.phone !== undefined) update.phone = payload.phone;
    if (payload.signs_off_on !== undefined) update.signs_off_on = payload.signs_off_on;
    if (payload.is_primary !== undefined) update.is_primary = payload.is_primary;
    if (payload.notes !== undefined) update.notes = payload.notes;

    const { data: person, error } = await db
      .from("client_people")
      .update(update)
      .eq("id", rowId)
      .eq("client_id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ person });
  } catch (e) {
    return errorResponse(e);
  }
}

