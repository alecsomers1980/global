import { verifyAdminPassword, createSessionCookie } from "@/lib/adminAuth";

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

  const { password, remember } = await request.json();

  const account = await verifyAdminPassword(password || "");
  if (!account) {
    return new Response(JSON.stringify({ error: "Incorrect password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await createSessionCookie(Boolean(remember));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
