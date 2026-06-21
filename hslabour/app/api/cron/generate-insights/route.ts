import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickNextCategory, generateInsight } from "@/lib/insights/generator";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: recent } = await supabase
      .from("insights_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(12);

    const recentTitles = (recent ?? []).map((p: { title: string }) => p.title);
    const recentCategories = (recent ?? []).map(
      (p: { category: string }) => p.category,
    );

    const now = new Date();
    const seventh = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 7, 6, 0, 0),
    );
    const twentyFirst = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 21, 6, 0, 0),
    );

    const cat1 = pickNextCategory(recentCategories);
    const post1 = await generateInsight(cat1, recentTitles);
    const cat2 = pickNextCategory([...recentCategories, cat1]);
    const post2 = await generateInsight(cat2, [...recentTitles, post1.title]);

    const { error } = await supabase.from("insights_posts").insert([
      {
        title: post1.title,
        slug: post1.slug,
        excerpt: post1.excerpt,
        meta_title: post1.meta_title,
        meta_description: post1.meta_description,
        content: post1.body_md,
        image_url: post1.image_url,
        category: cat1,
        status: "DRAFT",
        scheduled_for: seventh.toISOString(),
      },
      {
        title: post2.title,
        slug: post2.slug,
        excerpt: post2.excerpt,
        meta_title: post2.meta_title,
        meta_description: post2.meta_description,
        content: post2.body_md,
        image_url: post2.image_url,
        category: cat2,
        status: "DRAFT",
        scheduled_for: twentyFirst.toISOString(),
      },
    ]);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      generated: 2,
      scheduled_for: [seventh.toISOString(), twentyFirst.toISOString()],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[generate-insights]", message);
    return NextResponse.json(
      { error: "Failed to generate insights", message },
      { status: 500 },
    );
  }
}
