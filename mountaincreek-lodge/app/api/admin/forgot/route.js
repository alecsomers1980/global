import crypto from "crypto";
import { getAdminAccount } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPasswordResetEmail } from "@/lib/email";

const attempts = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many attempts, please wait a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email } = await request.json().catch(() => ({}));

  try {
    const account = await getAdminAccount();
    if (account && email && email.trim().toLowerCase() === account.email.toLowerCase()) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const { error } = await supabaseAdmin
        .from("admin_password_resets")
        .insert({ token, expires_at: expiresAt });
      if (error) throw error;

      await sendPasswordResetEmail(account.email, token);
    }
  } catch (err) {
    console.error("Forgot password error:", err);
  }

  // Always respond ok — never reveal whether the email matched.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
