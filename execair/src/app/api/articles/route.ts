import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { sanitizeArticleHtml } from "@/lib/sanitize";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50"), 1), 100);
  const publishedParam = searchParams.get("published");
  // Only admins can request unpublished articles
  let includeUnpublished = false;
  if (publishedParam === "false") {
    includeUnpublished = await (await import("@/lib/auth")).isAdminRequest(request);
  }

  try {
    let query = supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) query = query.eq("category", category);
    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("GET /api/articles failed");
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, image, category, author, cta_text, cta_url, published } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: String(title).slice(0, 200),
        slug: String(slug).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80),
        excerpt: excerpt ? String(excerpt).slice(0, 500) : "",
        content: content ? sanitizeArticleHtml(String(content)) : "",
        image: image ? String(image).slice(0, 500) : null,
        category: category ? String(category).slice(0, 80) : "General",
        author: author ? String(author).slice(0, 80) : "Exec-Air",
        cta_text: cta_text ? String(cta_text).slice(0, 120) : null,
        cta_url: cta_url ? String(cta_url).slice(0, 200) : null,
        published: published !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/articles failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
