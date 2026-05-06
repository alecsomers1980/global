import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  // Search across multiple columns using ilike
  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `customer_name.ilike.${term},company.ilike.${term},enquiry_details.ilike.${term},notes.ilike.${term},phone.ilike.${term},email.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
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
      status: body.status || "new",
      priority: body.priority || "standard",
      follow_up_date: body.follow_up_date || null,
      notes: body.notes || null,
      created_at: body.created_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
