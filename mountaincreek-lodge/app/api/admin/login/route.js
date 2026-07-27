import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(request) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Incorrect password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=${process.env.ADMIN_SESSION_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );

  return response;
}
