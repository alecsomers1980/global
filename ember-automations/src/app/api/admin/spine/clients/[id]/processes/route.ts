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
      name?: string;
      frequency?: string;
      volume?: string;
      owner_person_id?: string;
      pain?: string;
      notes?: string;
    }>(req);

    if (!payload.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const insert: Record<string, unknown> = { client_id: id, name: payload.name };
    if (payload.frequency !== undefined) insert.frequency = payload.frequency;
    if (payload.volume !== undefined) insert.volume = payload.volume;
    if (payload.owner_person_id !== undefined) insert.owner_person_id = payload.owner_person_id;
    if (payload.pain !== undefined) insert.pain = payload.pain;
    if (payload.notes !== undefined) insert.notes = payload.notes;

    const { data: process, error } = await db
      .from("client_processes")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ process });
  } catch (e) {
    return errorResponse(e);
  }
}

