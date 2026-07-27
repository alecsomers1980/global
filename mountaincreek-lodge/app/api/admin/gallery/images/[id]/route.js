import { isAdminAuthed, unauthorizedResponse } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request, { params }) {
  if (!(await isAdminAuthed())) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabaseAdmin
    .from("gallery_images")
    .update(body)
    .eq("id", id)
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

export async function DELETE(request, { params }) {
  if (!(await isAdminAuthed())) return unauthorizedResponse();

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("gallery_images")
    .delete()
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
