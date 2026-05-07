import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { sanitizeArticleHtml } from "@/lib/sanitize";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { slug } = await params;
  try {
    const body = await request.json();
    const { title, excerpt, content, image, category, author, cta_text, cta_url, published } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = String(title).slice(0, 200);
    if (excerpt !== undefined) updates.excerpt = String(excerpt).slice(0, 500);
    if (content !== undefined) updates.content = sanitizeArticleHtml(String(content));
    if (image !== undefined) updates.image = image ? String(image).slice(0, 500) : null;
    if (category !== undefined) updates.category = String(category).slice(0, 80);
    if (author !== undefined) updates.author = String(author).slice(0, 80);
    if (cta_text !== undefined) updates.cta_text = cta_text ? String(cta_text).slice(0, 120) : null;
    if (cta_url !== undefined) updates.cta_url = cta_url ? String(cta_url).slice(0, 200) : null;
    if (published !== undefined) updates.published = !!published;

    const { data, error } = await supabase
      .from("articles")
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT /api/articles failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { slug } = await params;
  try {
    const { error } = await supabase.from("articles").delete().eq("slug", slug);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
