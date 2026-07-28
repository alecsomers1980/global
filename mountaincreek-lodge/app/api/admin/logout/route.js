import { clearSessionCookie } from "@/lib/adminAuth";

export async function POST() {
  await clearSessionCookie();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
