import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/storage";
import { SOUTH_AFRICA } from "@/lib/dealer-types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Approve or decline a dealer application.
 *
 * Approving also CREATES the dealer from the application in one step, and
 * links the two via dealer_applications.dealer_id — otherwise Diana would
 * approve and then have to retype every detail into the add-dealer form.
 * Approving twice is a no-op: an application that already has a dealer_id
 * won't create a second record.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const status = body.status as "approved" | "declined" | "pending";

    if (!["approved", "declined", "pending"].includes(status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: application, error: loadErr } = await supabase
      .from("dealer_applications")
      .select("id, name, email, phone, country, province, town, business, dealer_id")
      .eq("id", id)
      .maybeSingle();
    if (loadErr) throw loadErr;
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const country = application.country || SOUTH_AFRICA;
    let dealerId: string | null = application.dealer_id;

    if (status === "approved" && !dealerId) {
      // A province is required for South Africa (it drives the public page's
      // grouping there); international applicants never fill one in.
      if (country === SOUTH_AFRICA && !application.province) {
        return NextResponse.json(
          {
            error:
              "This application has no province, so a dealer can't be created from it. Add the dealer manually instead.",
          },
          { status: 400 }
        );
      }

      const { data: dealer, error: insertErr } = await supabase
        .from("dealers")
        .insert({
          name: application.name,
          business: application.business ?? "",
          country,
          province: country === SOUTH_AFRICA ? application.province : "",
          areas: application.town ? [application.town] : [],
          phone: application.phone ?? "",
          email: application.email ?? "",
          // Hidden until Diana has filled in the details and ticked Active.
          active: false,
          notes: "Created from a dealer application.",
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      dealerId = dealer.id;
    }

    const { error: updErr } = await supabase
      .from("dealer_applications")
      .update({
        status,
        dealer_id: dealerId,
        admin_notes: typeof body.admin_notes === "string" ? body.admin_notes : undefined,
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", id);
    if (updErr) throw updErr;

    return NextResponse.json({ success: true, dealerId });
  } catch (error: any) {
    console.error("[admin.dealer-applications.patch]", error);
    return NextResponse.json(
      { error: error?.message || "Could not update this application." },
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
    const { error } = await supabase.from("dealer_applications").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin.dealer-applications.delete]", error);
    return NextResponse.json(
      { error: error?.message || "Could not delete this application." },
      { status: 500 }
    );
  }
}
