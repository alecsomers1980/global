import { isAdminAuthed, unauthorizedResponse } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request) {
  if (!(await isAdminAuthed())) return unauthorizedResponse();

  const { menuUrl } = await request.json();
  const { data, error } = await supabaseAdmin
    .from("red_litchi_settings")
    .upsert({ id: 1, menu_url: menuUrl })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
