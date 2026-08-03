import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminAccount } from "@/lib/adminAuth";

export async function POST(request) {
  const { token, password } = await request.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return new Response(JSON.stringify({ error: "Token is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!password || password.length < 8) {
    return new Response(JSON.stringify({ error: "Password must be at least 8 characters." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: reset, error: fetchError } = await supabaseAdmin
    .from("admin_password_resets")
    .select("token, expires_at, used")
    .eq("token", token)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (!reset || reset.used || new Date(reset.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "This reset link is invalid or has expired." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const account = await getAdminAccount();
  const hash = await bcrypt.hash(password, 10);

  const { error: updateError } = await supabaseAdmin
    .from("admin_account")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq("id", account.id);
  if (updateError) throw updateError;

  await supabaseAdmin.from("admin_password_resets").update({ used: true }).eq("token", token);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
