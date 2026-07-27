import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
  const response = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );

  return response;
}
