import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const slug = form.get("slug") as string;
  const questionId = form.get("questionId") as string;
  if (!file || !slug || !questionId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const db = serviceClient();
  const { data: qn } = await db.from("questionnaires").select("id").eq("slug", slug).single();
  if (!qn) return NextResponse.json({ error: "not found" }, { status: 404 });

  const path = `${slug}/${questionId}/${Date.now()}-${file.name}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await db.storage.from("intake-uploads").upload(path, buf, {
    contentType: file.type,
    upsert: true,
  });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 });

  await db.from("uploads").insert({
    questionnaire_id: qn.id,
    question_id: questionId,
    storage_path: path,
    filename: file.name,
    content_type: file.type,
    size: file.size,
  });

  return NextResponse.json({ path, filename: file.name });
}
