import bcrypt from "bcryptjs";
import { isAdminAuthed, unauthorizedResponse, verifyAdminPassword } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request) {
  if (!(await isAdminAuthed())) return unauthorizedResponse();

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));

  if (!newPassword || newPassword.length < 8) {
    return new Response(JSON.stringify({ error: "New password must be at least 8 characters." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const account = await verifyAdminPassword(currentPassword || "");
  if (!account) {
    return new Response(JSON.stringify({ error: "Current password is incorrect." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabaseAdmin
    .from("admin_account")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq("id", account.id);
  if (error) throw error;

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
