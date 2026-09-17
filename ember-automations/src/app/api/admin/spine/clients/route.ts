import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { parsePlan } from "@/lib/spine/plan";
import { errorResponse, json } from "../_lib";

export async function GET(req: NextRequest) {
  try {
    const db = serviceClient();
    const q = req.nextUrl.searchParams.get("q");

    let query = db.from("clients").select("*");
    if (q) {
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    const { data: clients, error } = await query.order("name", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ clients });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = serviceClient();
    const payload = await json<{
      slug?: string;
      name?: string;
      vertical?: string;
      ai_provider?: string;
      plan?: unknown;
    }>(req);

    if (!payload.slug || !payload.name) {
      return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      slug: payload.slug,
      name: payload.name,
    };
    if (payload.vertical !== undefined) insert.vertical = payload.vertical;
    if (payload.ai_provider !== undefined) insert.ai_provider = payload.ai_provider;
    if (payload.plan !== undefined) insert.plan = parsePlan(payload.plan);

    const { data: client, error } = await db
      .from("clients")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ client });
  } catch (e) {
    return errorResponse(e);
  }
}

