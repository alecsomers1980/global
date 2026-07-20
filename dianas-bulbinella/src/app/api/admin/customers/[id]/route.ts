import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Edit or delete one customer.
 *
 * Every handler here runs with the service-role client, which bypasses RLS, so
 * two guards are mandatory and neither may be removed:
 *   1. requireStaff() — the caller must be staff/admin.
 *   2. assertCustomer() — the TARGET must have role 'customer'. Without this a
 *      staff member could edit or delete an admin account through a route
 *      that is only meant for customer management.
 */

type Ctx = { params: Promise<{ id: string }> };

async function assertCustomer(id: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("id", id)
    .maybeSingle();

  if (!profile) return { ok: false as const, status: 404, error: "Customer not found" };
  if (profile.role !== "customer") {
    return {
      ok: false as const,
      status: 403,
      error: "That account is a staff member, not a customer.",
    };
  }
  return { ok: true as const, profile };
}

export async function PATCH(req: Request, { params }: Ctx) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const target = await assertCustomer(id);
    if (!target.ok) {
      return NextResponse.json({ error: target.error }, { status: target.status });
    }

    const body = await req.json();
    // Only these two fields — role is deliberately not editable here.
    const patch = {
      full_name: typeof body.full_name === "string" ? body.full_name.trim() : "",
      phone: typeof body.phone === "string" ? body.phone.trim() : "",
    };

    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update(patch).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin.customers.patch]", error);
    return NextResponse.json(
      { error: error?.message || "Could not save this customer." },
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
    const target = await assertCustomer(id);
    if (!target.ok) {
      return NextResponse.json({ error: target.error }, { status: target.status });
    }

    const admin = createAdminClient();
    // Deleting the auth user cascades to profiles/addresses/wishlist. Orders
    // survive with user_id set to null (see 0004) so sales history and the
    // monthly report stay intact.
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin.customers.delete]", error);
    return NextResponse.json(
      { error: error?.message || "Could not delete this customer." },
      { status: 500 }
    );
  }
}
