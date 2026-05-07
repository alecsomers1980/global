import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_STATUS = new Set(["new", "warm_lead", "confirmed", "on_hold", "no_answer"]);
const ALLOWED_PRIORITY = new Set(["high", "standard"]);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json();

  const { data, error } = await supabase
    .from("enquiries")
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("PUT /api/enquiries failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { error } = await supabase
    .from("enquiries")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("DELETE /api/enquiries failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
