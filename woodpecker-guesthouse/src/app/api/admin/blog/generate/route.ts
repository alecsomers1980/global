import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBlogPost } from "@/lib/blog/generator";
import { BLOG_CATEGORIES, pickNextCategory, type BlogCategory } from "@/lib/blog/categories";
import { sendBlogReviewEmail } from "@/lib/blog/email";

export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  // Same auth pattern as the upload route (Task 9, Plan B): server client
  // returns null when Supabase isn't configured, treat that as unauthorized too.
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}) as { category?: string });

  try {
    const { data: recent } = await supabase
      .from("blog_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(12);
    const recentTitles = (recent ?? []).map((r) => r.title).filter(Boolean);
    const recentCategories = (recent ?? []).map((r) => r.category).filter(Boolean);

    let category: BlogCategory;
    if (body.category && (BLOG_CATEGORIES as readonly string[]).includes(body.category)) {
      category = body.category as BlogCategory;
    } else {
      category = pickNextCategory(recentCategories);
    }

    const generated = await generateBlogPost({ category, recentTitles });

    let slug = generated.slug || slugify(generated.title) || "article";
    for (let attempt = 0; attempt < 10; attempt++) {
      const { count } = await supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("slug", slug);
      if (!count) break;
      slug = `${generated.slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data: inserted, error } = await supabase
      .from("blog_posts")
      .insert({
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        meta_title: generated.meta_title,
        meta_description: generated.meta_description,
        content: generated.body_md,
        category,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await sendBlogReviewEmail({ titles: [generated.title] }).catch((err) =>
      console.error("[blog/generate] review email failed:", err)
    );

    return NextResponse.json({ post: inserted }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || "Failed to generate article";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI is not configured yet. Add ANTHROPIC_API_KEY in Vercel to enable article generation." },
        { status: 400 }
      );
    }
    console.error("[blog/generate]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}