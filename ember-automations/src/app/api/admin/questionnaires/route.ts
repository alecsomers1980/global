import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { assembleQuestionSet } from "@/lib/questionBank";
import { makeSlug } from "@/lib/slug";
import type { ModuleId, Question } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { client_name, project_name, type, modules, custom } = (await req.json()) as {
    client_name: string; project_name: string; type: string;
    modules: ModuleId[]; custom?: Question[];
  };

  if (!client_name || !project_name) {
    return NextResponse.json({ error: "client_name and project_name are required" }, { status: 400 });
  }

  const question_set = assembleQuestionSet(modules ?? [], custom ?? []);
  const slug = makeSlug(project_name);

  const db = serviceClient();
  const { error } = await db.from("questionnaires")
    .insert({ slug, client_name, project_name, type, status: "sent", question_set });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ slug });
}
