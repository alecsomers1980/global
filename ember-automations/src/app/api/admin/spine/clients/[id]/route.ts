import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { parsePlan } from "@/lib/spine/plan";
import { getClient } from "@/lib/spine/record";
import { listRequests, creditBalance, activeCount } from "@/lib/spine/requests";
import { shadowStats } from "@/lib/spine/outbox";
import { errorResponse, json } from "../../_lib";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;

    const client = await getClient(db, id);
    if (!client) {
      return NextResponse.json({ error: "client not found" }, { status: 404 });
    }

    const [
      peopleRes,
      systemsRes,
      processesRes,
      factsRes,
      assetsRes,
      questionsRes,
      requests,
      ledgerRes,
      balance,
      shadow,
      active,
    ] = await Promise.all([
      db
        .from("client_people")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: true }),
      db.from("client_systems").select("*").eq("client_id", id),
      db.from("client_processes").select("*").eq("client_id", id),
      db
        .from("client_facts")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      db.from("client_assets").select("*").eq("client_id", id),
      db
        .from("questions")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      listRequests(db, id),
      db
        .from("credits_ledger")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      creditBalance(db, client),
      shadowStats(db, id, 30),
      activeCount(db, id),
    ]);

    if (peopleRes.error) return NextResponse.json({ error: peopleRes.error.message }, { status: 400 });
    if (systemsRes.error) return NextResponse.json({ error: systemsRes.error.message }, { status: 400 });
    if (processesRes.error) return NextResponse.json({ error: processesRes.error.message }, { status: 400 });
    if (factsRes.error) return NextResponse.json({ error: factsRes.error.message }, { status: 400 });
    if (assetsRes.error) return NextResponse.json({ error: assetsRes.error.message }, { status: 400 });
    if (questionsRes.error) return NextResponse.json({ error: questionsRes.error.message }, { status: 400 });
    if (ledgerRes.error) return NextResponse.json({ error: ledgerRes.error.message }, { status: 400 });

    return NextResponse.json({
      client,
      people: peopleRes.data ?? [],
      systems: systemsRes.data ?? [],
      processes: processesRes.data ?? [],
      facts: factsRes.data ?? [],
      assets: assetsRes.data ?? [],
      questions: questionsRes.data ?? [],
      requests,
      ledger: ledgerRes.data ?? [],
      balance,
      shadow,
      active,
    });
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

    const payload = await json<{
      name?: string;
      vertical?: string;
      status?: string;
      approval_mode?: string;
      ai_provider?: string;
      plan?: unknown;
      notes?: string;
    }>(req);

    const update: Record<string, unknown> = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.vertical !== undefined) update.vertical = payload.vertical;
    if (payload.status !== undefined) update.status = payload.status;
    if (payload.approval_mode !== undefined) update.approval_mode = payload.approval_mode;
    if (payload.ai_provider !== undefined) update.ai_provider = payload.ai_provider;
    if (payload.plan !== undefined) update.plan = parsePlan(payload.plan);
    if (payload.notes !== undefined) update.notes = payload.notes;

    const { data: client, error } = await db
      .from("clients")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ client });
  } catch (e) {
    return errorResponse(e);
  }
}

