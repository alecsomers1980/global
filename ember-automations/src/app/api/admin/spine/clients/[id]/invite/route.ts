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
    const payload = await json<{ person_id?: string }>(req);

    if (!payload.person_id) {
      return NextResponse.json({ error: "person_id is required" }, { status: 400 });
    }

    const { data: person, error } = await db
      .from("client_people")
      .select("*")
      .eq("id", payload.person_id)
      .eq("client_id", id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!person) return NextResponse.json({ error: "person not found" }, { status: 404 });
    if (!person.email) return NextResponse.json({ error: "person has no email" }, { status: 400 });

    const { data, error: inviteError } = await db.auth.admin.inviteUserByEmail(
      person.email,
      { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login` },
    );
    if (inviteError) throw new Error(inviteError.message);

    if (!data.user) throw new Error("invite did not return a user");

    const { error: updateError } = await db.auth.admin.updateUserById(data.user.id, {
      app_metadata: { role: "client", client_id: id },
    });
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ user_id: data.user.id, email: person.email });
  } catch (e) {
    return errorResponse(e);
  }
}

