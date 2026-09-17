import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../_lib";
import { createRequest } from "@/lib/spine/requests";
import { triageAndQueue } from "@/lib/spine/triageRun";

export async function POST(req: NextRequest) {
  try {
    const body = await json<{
      client_id: string;
      title: string;
      description: string;
      why_it_matters?: string;
      affected_area?: string;
      examples?: string;
      deadline?: string;
      catalogue_item_id?: string;
    }>(req);

    if (!body.client_id || !body.title || !body.description) {
      return NextResponse.json(
        { error: "client_id, title and description are required" },
        { status: 400 }
      );
    }

    const db = serviceClient();
    const request = await createRequest(db, {
      ...body,
      source: "admin",
      submitted_by: "alec",
    });

    try {
      const { outboxId } = await triageAndQueue(db, request.id);
      return NextResponse.json({ request, outboxId });
    } catch (e) {
      return NextResponse.json(
        { request, triage: "pending", error: (e as Error).message },
        { status: 202 }
      );
    }
  } catch (e) {
    return errorResponse(e);
  }
}

