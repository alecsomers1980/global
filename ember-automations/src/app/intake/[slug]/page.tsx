import { serviceClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import QuestionnaireForm from "./QuestionnaireForm";
import type { Questionnaire } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function IntakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = serviceClient();
  const { data } = await db.from("questionnaires").select("*").eq("slug", slug).single();
  if (!data) notFound();
  const qn = data as Questionnaire;

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6">
      <header className="mb-8">
        <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
          Ember Automations · Discovery
        </p>
        <h1 className="text-3xl font-extrabold mt-1">{qn.project_name}</h1>
        <p className="text-[#6b6b8a] mt-2">
          Hi {qn.client_name} — a few questions so we can scope and build the right thing.
          Your progress saves automatically.
        </p>
      </header>
      <QuestionnaireForm
        slug={qn.slug}
        questionSet={qn.question_set}
        initialAnswers={qn.answers}
        status={qn.status}
      />
    </main>
  );
}
