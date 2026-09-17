import { notFound } from "next/navigation";
import { serviceClient } from "@/lib/supabaseServer";
import { getRequest, listEvents, listRequests } from "@/lib/spine/requests";
import { getClient } from "@/lib/spine/record";
import { queuePosition, TRANSITIONS } from "@/lib/spine/state";
import RequestActions from "./RequestActions";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = serviceClient();
  const request = await getRequest(db, id);
  if (!request) notFound();

  const [client, events, siblings] = await Promise.all([
    getClient(db, request.client_id),
    listEvents(db, id),
    listRequests(db, request.client_id),
  ]);

  const position = queuePosition(siblings, id);

  return (
    <div className="space-y-4">
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{request.title}</h1>
          <span className="text-xs uppercase tracking-wide text-ember-500">{request.status.replace(/_/g, " ")}</span>
        </div>

        <p className="text-sm text-[#6b6b8a]">
          Client: {client ? (
            <a className="text-ember-500" href={`/admin/clients/${client.id}`}>{client.name}</a>
          ) : "—"} · Size {request.size ?? "—"} · Credits {request.credits ?? "—"} · Queue position {position ?? "—"} · Due {request.estimate?.due_by ? new Date(request.estimate.due_by).toLocaleDateString("en-ZA") : "—"}
        </p>

        <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {request.description ? (
            <div>
              <dt className="text-[#6b6b8a]">Description</dt>
              <dd className="mt-1">{request.description}</dd>
            </div>
          ) : null}
          {request.why_it_matters ? (
            <div>
              <dt className="text-[#6b6b8a]">Why it matters</dt>
              <dd className="mt-1">{request.why_it_matters}</dd>
            </div>
          ) : null}
          {request.affected_area ? (
            <div>
              <dt className="text-[#6b6b8a]">Affected area</dt>
              <dd className="mt-1">{request.affected_area}</dd>
            </div>
          ) : null}
          {request.examples ? (
            <div>
              <dt className="text-[#6b6b8a]">Examples</dt>
              <dd className="mt-1">{request.examples}</dd>
            </div>
          ) : null}
          {request.deadline ? (
            <div>
              <dt className="text-[#6b6b8a]">Deadline</dt>
              <dd className="mt-1">{new Date(request.deadline).toLocaleDateString("en-ZA")}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {request.estimate ? (
        <div className="glass p-6">
          <h2 className="text-lg font-bold mb-4">Estimate</h2>
          <p className="text-sm mb-2">{request.estimate.summary}</p>
          <p className="text-sm text-[#6b6b8a]">Credits: {request.estimate.credits}</p>
          {request.estimate.assumptions?.length ? (
            <>
              <h3 className="text-sm uppercase tracking-wide text-ember-500 mt-4 mb-2">Assumptions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {request.estimate.assumptions.map((assumption, index) => (
                  <li key={index}>{assumption}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      <RequestActions id={id} status={request.status} updatedAt={request.updated_at} allowed={TRANSITIONS[request.status] ?? []} />

      <div className="glass p-6">
        <h2 className="text-lg font-bold mb-4">Events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-[#6b6b8a]">No events yet.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="border-t border-[#2a2a3d] pt-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[#6b6b8a]">{new Date(event.created_at).toLocaleString("en-ZA")}</span>
                  <span className="text-xs uppercase tracking-wide text-ember-500">{event.type}</span>
                  <span>{event.actor ?? "—"}</span>
                </div>
                {event.payload && Object.keys(event.payload).length > 0 ? (
                  <pre className="mt-2 text-xs text-[#6b6b8a] whitespace-pre-wrap">{JSON.stringify(event.payload)}</pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
