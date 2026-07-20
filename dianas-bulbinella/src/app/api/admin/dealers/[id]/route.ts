import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/storage";
import { dealerToRow, SOUTH_AFRICA } from "@/lib/dealers";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const country = String(body.country ?? "").trim() || SOUTH_AFRICA;
    if (!body.name?.trim() || (country === SOUTH_AFRICA && !body.province?.trim())) {
      return NextResponse.json(
        { error: "A name is required (and a province, for South Africa)." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("dealers").update(dealerToRow(body)).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin.dealers.patch]", error);
    return NextResponse.json(
      { error: error?.message || "Could not save this dealer." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("dealers").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin.dealers.delete]", error);
    return NextResponse.json(
      { error: error?.message || "Could not delete this dealer." },
      { status: 500 }
    );
  }
}
