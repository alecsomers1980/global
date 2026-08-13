import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBlogPost } from "@/lib/blog/generator";
import { pickNextCategory, type BlogCategory } from "@/lib/blog/categories";
import { sendBlogReviewEmail } from "@/lib/blog/email";

export const runtime = "nodejs";
export const maxDuration = 300;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const { data: recent } = await supabase
      .from("blog_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(12);
    const recentTitles = (recent ?? []).map((r) => r.title).filter(Boolean);
    const recentCategories = (recent ?? []).map((r) => r.category).filter(Boolean);

    const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
      let candidate = baseSlug || "article";
      for (let attempt = 0; attempt < 10; attempt++) {
        const { count } = await supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("slug", candidate);
        if (!count) return candidate;
        candidate = `${baseSlug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      }
      throw new Error(`Could not generate a unique slug for "${baseSlug}"`);
    };

    const category1: BlogCategory = pickNextCategory(recentCategories);
    const article1 = await generateBlogPost({ category: category1, recentTitles });
    const slug1 = await ensureUniqueSlug(article1.slug || slugify(article1.title));

    const category2: BlogCategory = pickNextCategory([...recentCategories, category1]);
    const article2 = await generateBlogPost({ category: category2, recentTitles: [...recentTitles, article1.title] });
    const slug2 = await ensureUniqueSlug(article2.slug || slugify(article2.title));

    const { error } = await supabase.from("blog_posts").insert([
      {
        title: article1.title,
        slug: slug1,
        excerpt: article1.excerpt,
        meta_title: article1.meta_title,
        meta_description: article1.meta_description,
        content: article1.body_md,
        category: category1,
        status: "draft",
      },
      {
        title: article2.title,
        slug: slug2,
        excerpt: article2.excerpt,
        meta_title: article2.meta_title,
        meta_description: article2.meta_description,
        content: article2.body_md,
        category: category2,
        status: "draft",
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    await sendBlogReviewEmail({ titles: [article1.title, article2.title] }).catch((err) =>
      console.error("[generate-blog] review email failed:", err)
    );

    return NextResponse.json({ success: true, generated: 2 });
  } catch (error: any) {
    console.error("[generate-blog] Error:", error);
    return NextResponse.json({ error: "Failed to generate blog posts", message: error?.message }, { status: 500 });
  }
}