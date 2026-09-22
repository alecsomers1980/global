import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../../_lib";
import { parsePlan } from "@/lib/spine/plan";
import { getClient } from "@/lib/spine/record";
import { getRequest, listEvents, listRequests, transition } from "@/lib/spine/requests";
import { queuePosition, TRANSITIONS } from "@/lib/spine/state";
import type { RequestStatus } from "@/lib/spine/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = serviceClient();

    const request = await getRequest(db, id);
    if (!request) return NextResponse.json({ error: "request not found" }, { status: 404 });

    const events = await listEvents(db, id);
    const siblings = await listRequests(db, request.client_id);
    const queue_position = queuePosition(siblings, id);

    return NextResponse.json({ request, events, queue_position });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { to, expectedUpdatedAt, payload } = await json<{
      to: RequestStatus;
      expectedUpdatedAt?: string;
      payload?: Record<string, unknown>;
    }>(req);

    if (!(to in TRANSITIONS)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const db = serviceClient();

    if (to === "scheduled") {
      const request = await getRequest(db, id);
      if (!request) return NextResponse.json({ error: "request not found" }, { status: 404 });

      const client = await getClient(db, request.client_id);
      const plan = parsePlan(client!.plan);
      // The cap is on work in progress; client_approved rows are queued, not active.
      const inProgress: RequestStatus[] = ["scheduled", "in_progress"];
      const { count, error } = await db.from("requests")
        .select("id", { count: "exact", head: true })
        .eq("client_id", request.client_id)
        .in("status", inProgress);
      if (error) throw new Error(error.message);

      if (!inProgress.includes(request.status) && (count ?? 0) >= plan.max_active) {
        return NextResponse.json(
          { error: "max active requests reached", max_active: plan.max_active },
          { status: 409 }
        );
      }
    }

    const updated = await transition(db, id, to, "alec", { expectedUpdatedAt, payload });
    return NextResponse.json({ request: updated });
  } catch (e) {
    return errorResponse(e);
  }
}

