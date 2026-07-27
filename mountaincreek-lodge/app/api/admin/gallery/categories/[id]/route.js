import { isAdminAuthed, unauthorizedResponse } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request, { params }) {
  if (!(await isAdminAuthed())) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabaseAdmin
    .from("gallery_categories")
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

  // Images that belonged to this category fall back to Uncategorized.
  await supabaseAdmin
    .from("gallery_images")
    .update({ category_id: null })
    .eq("category_id", id);

  const { error } = await supabaseAdmin
    .from("gallery_categories")
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
