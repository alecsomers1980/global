import { notFound } from "next/navigation";
import { serviceClient } from "@/lib/supabaseServer";
import { resolveLink, linkPayload } from "@/lib/spine/links";
import LinkActions from "./LinkActions";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = serviceClient();

  const link = await resolveLink(db, token);
  if (!link) notFound();

  const payload = await linkPayload(db, link);

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6">
      {payload.kind === "question_batch" ? (
        <>
          <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
            Ember Automations · A few questions
          </p>
          <h1 className="text-3xl font-extrabold mt-1">Help us get this right</h1>
          <p className="text-[#6b6b8a] mt-2">
            Hi {payload.client_name} — answers here go straight to Ember.
          </p>

          {payload.questions.some((q) => q.status === "sent") ? (
            <div className="mt-6">
              <LinkActions
                token={token}
                mode="questions"
                questions={payload.questions
                  .filter((q) => q.status === "sent")
                  .map((q) => ({ id: q.id, text: q.text }))}
              />
            </div>
          ) : (
            <div className="glass p-8 text-center mt-6">
              <h2 className="font-semibold">Thank you — we have your answers.</h2>
              <div className="mt-4 space-y-4 text-left">
                {payload.questions.map((q) => (
                  <div key={q.id}>
                    <p className="font-medium">{q.text}</p>
                    <p className="text-[#6b6b8a]">{q.answer || "No answer"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
            Ember Automations · Your request
          </p>
          <h1 className="text-3xl font-extrabold mt-1">{payload.request.title}</h1>
          <p className="text-[#6b6b8a] mt-1">
            Status: {payload.request.status.replace(/_/g, " ")}
            {payload.kind === "request" && payload.queue_position !== null
              ? ` · Queue position ${payload.queue_position}`
              : ""}
          </p>

          <div className="glass p-5 mt-6">
            <p className="whitespace-pre-wrap">{payload.request.description}</p>
          </div>

          {payload.request.estimate ? (
            <div className="glass p-5 mt-4">
              <h2 className="font-semibold">Estimate</h2>
              <p className="mt-2">{payload.request.estimate.summary}</p>
              <p className="mt-2">{payload.request.estimate.credits} credit(s)</p>
              <p className="mt-2">
                Due by{" "}
                {payload.request.estimate.due_by
                  ? new Date(payload.request.estimate.due_by).toLocaleDateString("en-ZA")
                  : "to be confirmed"}
              </p>
              {payload.request.estimate.assumptions.length > 0 ? (
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {payload.request.estimate.assumptions.map((assumption, i) => (
                    <li key={i}>{assumption}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {payload.request.status === "estimated" ? (
            <div className="mt-6">
              <LinkActions token={token} mode="estimate" updatedAt={payload.request.updated_at} />
            </div>
          ) : null}

          {["client_approved", "scheduled", "in_progress"].includes(payload.request.status) ? (
            <p className="text-[#6b6b8a] mt-6">Approved — Ember is on it.</p>
          ) : null}

          {["delivered", "closed"].includes(payload.request.status) ? (
            <p className="text-[#6b6b8a] mt-6">Delivered. Thank you.</p>
          ) : null}

          {payload.request.status === "declined" ? (
            <p className="text-[#6b6b8a] mt-6">
              You declined this estimate. Ember will come back to you.
            </p>
          ) : null}
        </>
      )}

      <p className="text-[#6b6b8a] text-sm mt-8">
        This link is private to you. Questions? Reply to the email you received.
      </p>
    </main>
  );
}

