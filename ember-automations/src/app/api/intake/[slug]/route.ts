import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { notifySubmission } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = serviceClient();
  const { data, error } = await db.from("questionnaires").select("*").eq("slug", slug).single();
  if (error || !data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ questionnaire: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { answers } = await req.json();
  const db = serviceClient();
  const { error } = await db.from("questionnaires")
    .update({ answers, status: "in_progress", updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = serviceClient();
  const { error } = await db.from("questionnaires")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: qn } = await db.from("questionnaires")
    .select("id, client_name, project_name, slug").eq("slug", slug).single();
  if (qn) await notifySubmission(qn);

  return NextResponse.json({ ok: true });
}
