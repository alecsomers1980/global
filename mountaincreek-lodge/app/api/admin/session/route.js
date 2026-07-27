import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  const authed = await isAdminAuthed();
  return new Response(JSON.stringify({ authed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
