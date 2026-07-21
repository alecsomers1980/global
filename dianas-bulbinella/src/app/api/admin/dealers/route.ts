import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/storage";
import { dealerToRow, SOUTH_AFRICA } from "@/lib/dealers";

export const runtime = "nodejs";

/** Create a dealer. Writes go through the request-scoped client so the
 *  "staff write dealers" RLS policy still applies — requireStaff is the early,
 *  friendly check, RLS is the actual guarantee. */
export async function POST(req: Request) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const body = await req.json();
    // Province is required for South Africa (it drives the grouping there)
    // but Diana's international lists are town-only — Namibia/Botswana/
    // Mozambique dealers have no province at all.
    const country = String(body.country ?? "").trim() || SOUTH_AFRICA;
    if (!body.name?.trim() || (country === SOUTH_AFRICA && !body.province?.trim())) {
      return NextResponse.json(
        { error: "A name is required (and a province, for South Africa)." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dealers")
      .insert(dealerToRow(body))
      .select("id")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error("[admin.dealers.post]", error);
    return NextResponse.json(
      { error: error?.message || "Could not save this dealer." },
      { status: 500 }
    );
  }
}
