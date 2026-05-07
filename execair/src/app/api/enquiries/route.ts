import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SAFE_TERM = /^[\p{L}\p{N} _.@+\-]{1,64}$/u;
const ALLOWED_STATUS = new Set(["new", "warm_lead", "confirmed", "on_hold", "no_answer"]);
const ALLOWED_PRIORITY = new Set(["high", "standard"]);

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50"), 1), 200);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && ALLOWED_STATUS.has(status)) query = query.eq("status", status);
  if (priority && ALLOWED_PRIORITY.has(priority)) query = query.eq("priority", priority);

  if (search && SAFE_TERM.test(search)) {
    const term = `%${search}%`;
    query = query.or(
      `customer_name.ilike.${term},company.ilike.${term},enquiry_details.ilike.${term},notes.ilike.${term},phone.ilike.${term},email.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("GET /api/enquiries failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json();

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      customer_name: body.customer_name,
      company: body.company || null,
      phone: body.phone || null,
      email: body.email || null,
      enquiry_details: body.enquiry_details || "",
      quote_value: parseFloat(body.quote_value) || 0,
      actual_value: parseFloat(body.actual_value) || 0,
      status: ALLOWED_STATUS.has(body.status) ? body.status : "new",
      priority: ALLOWED_PRIORITY.has(body.priority) ? body.priority : "standard",
      follow_up_date: body.follow_up_date || null,
      notes: body.notes || null,
      created_at: body.created_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("POST /api/enquiries failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
