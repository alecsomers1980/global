import { notFound } from "next/navigation";
import { serviceClient } from "@/lib/supabaseServer";
import { getClient } from "@/lib/spine/record";
import { listRequests, creditBalance, activeCount } from "@/lib/spine/requests";
import { shadowStats } from "@/lib/spine/outbox";
import { parsePlan } from "@/lib/spine/plan";
import type {
  ClientPerson,
  ClientSystem,
  ClientProcess,
  ClientFact,
  ClientAsset,
  Question,
  RequestRow,
  CreditRow,
  CatalogueItem,
} from "@/lib/spine/types";
import RecordTabs from "./RecordTabs";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = serviceClient();
  const client = await getClient(db, id);
  if (!client) notFound();

  const [
    people,
    systems,
    processes,
    facts,
    assets,
    questions,
    requests,
    ledger,
    balance,
    shadow,
    active,
    catalogue,
  ] = await Promise.all([
    db
      .from("people")
      .select("*")
      .eq("client_id", id)
      .order("created_at")
      .then(({ data }) => (data ?? []) as ClientPerson[]),
    db
      .from("systems")
      .select("*")
      .eq("client_id", id)
      .order("created_at")
      .then(({ data }) => (data ?? []) as ClientSystem[]),
    db
      .from("processes")
      .select("*")
      .eq("client_id", id)
      .order("created_at")
      .then(({ data }) => (data ?? []) as ClientProcess[]),
    db
      .from("facts")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => (data ?? []) as ClientFact[]),
    db
      .from("assets")
      .select("*")
      .eq("client_id", id)
      .order("created_at")
      .then(({ data }) => (data ?? []) as ClientAsset[]),
    db
      .from("questions")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => (data ?? []) as Question[]),
    listRequests(db, id),
    db
      .from("credits_ledger")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => (data ?? []) as CreditRow[]),
    creditBalance(db, client),
    shadowStats(db, id, 30),
    activeCount(db, id),
    db
      .from("catalogue_items")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => (data ?? []) as CatalogueItem[]),
  ]);

  const plan = parsePlan(client.plan);

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <span className="text-xs uppercase tracking-wide text-ember-500">
            {client.status}
          </span>
        </div>
        <p className="text-[#6b6b8a] text-sm">/{client.slug}</p>
      </div>

      <div className="glass p-4">
        <p className="text-sm text-[#6b6b8a]">
          Balance: {balance} credits · Active: {active} · Plan:{" "}
          {plan.monthly_credits}/month, max {plan.max_active} active · Provider:{" "}
          {client.ai_provider ?? "—"} · Mode {client.approval_mode}
        </p>
      </div>

      <RecordTabs
        client={client}
        people={people}
        systems={systems}
        processes={processes}
        facts={facts}
        assets={assets}
        questions={questions}
        requests={requests}
        ledger={ledger}
        balance={balance}
        shadow={shadow}
        catalogue={catalogue}
        plan={plan}
      />
    </div>
  );
}
