import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Send a customer a password-reset email.
 *
 * Staff never see or set the password themselves — Supabase mails a recovery
 * link that lands on the same /reset-password page the public "forgot
 * password" flow uses. Same guards as the sibling route: caller must be staff,
 * target must be a customer.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("email, role")
      .eq("id", id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    if (profile.role !== "customer") {
      return NextResponse.json(
        { error: "That account is a staff member, not a customer." },
        { status: 403 }
      );
    }
    if (!profile.email) {
      return NextResponse.json(
        { error: "This customer has no email address on file." },
        { status: 400 }
      );
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    // resetPasswordForEmail is a normal auth call (not an admin one), so use
    // the request-scoped client; the service-role client is only for the
    // role lookup above.
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${origin}/reset-password`,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, email: profile.email });
  } catch (error: any) {
    console.error("[admin.customers.reset]", error);
    return NextResponse.json(
      { error: error?.message || "Could not send the reset email." },
      { status: 500 }
    );
  }
}
