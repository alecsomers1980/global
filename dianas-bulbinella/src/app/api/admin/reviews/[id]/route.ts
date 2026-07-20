import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_STATUSES = ["approved", "pending", "hidden"] as const;
type Status = (typeof ALLOWED_STATUSES)[number];

/** Moderate a review: change its status and/or set Diana's public reply.
 *  Staff only. Service-role because the recount trigger and the status change
 *  both need to run regardless of the caller's RLS view. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const patch: { status?: Status; staff_reply?: string } = {};

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = body.status;
    }
    if (body.staffReply !== undefined) {
      patch.staff_reply = String(body.staffReply).trim().slice(0, 2000);
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { error } = await createAdminClient().from("reviews").update(patch).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/admin/reviews/[id] failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/** Delete a review outright (spam / abuse). Hiding is usually preferable —
 *  it keeps the record — but staff can remove it entirely. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const { id } = await params;
    const { error } = await createAdminClient().from("reviews").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/reviews/[id] failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
