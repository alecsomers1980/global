import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, reportRecipient } from "@/lib/resend";
import { generateBlogPost, pickNextCategory } from "@/lib/blog/generator";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Monthly Journal generator. Drafts two compliant articles and schedules them
 * for the 7th and 21st, then emails Diana so she can review + approve them in
 * /admin/blog. Nothing publishes here — publish-blog flips APPROVED posts live.
 * Run on the 1st (see vercel.json). `?dryRun=1` generates without saving.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
    const admin = createAdminClient();

    const { data: recent } = await admin
      .from("blog_posts")
      .select("title, category, slug")
      .order("created_at", { ascending: false })
      .limit(12);

    const recentTitles = (recent ?? []).map((p) => p.title as string);
    const recentCategories = (recent ?? []).map((p) => p.category as string);
    const existingSlugs = new Set((recent ?? []).map((p) => p.slug as string));

    const now = new Date();
    const seventh = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 7, 6, 0, 0));
    const twentyFirst = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 21, 6, 0, 0));

    const cat1 = pickNextCategory(recentCategories);
    const post1 = await generateBlogPost({ category: cat1, recentTitles });

    const cat2 = pickNextCategory([...recentCategories, cat1]);
    const post2 = await generateBlogPost({
      category: cat2,
      recentTitles: [...recentTitles, post1.title],
    });

    // Keep slugs unique (the column is UNIQUE — a collision would fail the insert).
    const ensureUnique = (slug: string) => {
      let s = slug || "post";
      while (existingSlugs.has(s)) s = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      existingSlugs.add(s);
      return s;
    };

    const rows = [
      { post: post1, category: cat1, scheduled_for: seventh.toISOString() },
      { post: post2, category: cat2, scheduled_for: twentyFirst.toISOString() },
    ].map(({ post, category, scheduled_for }) => ({
      title: post.title,
      slug: ensureUnique(post.slug),
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      content: post.body_md,
      image_url: post.image_url,
      category,
      status: "draft" as const,
      scheduled_for,
    }));

    if (dryRun) {
      return NextResponse.json({ dryRun: true, generated: rows.map((r) => ({ title: r.title, category: r.category, scheduled_for: r.scheduled_for })) });
    }

    const { error } = await admin.from("blog_posts").insert(rows);
    if (error) throw error;

    const recipient = reportRecipient();
    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: "2 new Journal drafts — awaiting your review",
        html:
          "<p>Two new Journal articles have been drafted and are waiting in the admin portal as <strong>drafts</strong>.</p>" +
          "<p>Please review, edit if needed, and approve them for the 7th and 21st.</p>" +
          `<ul><li>${rows[0].title}</li><li>${rows[1].title}</li></ul>` +
          '<p><a href="' + (process.env.NEXT_PUBLIC_SITE_URL || "") + '/admin/blog">Open the Journal admin</a></p>',
      }).catch((e) => console.error("[generate-blog] email failed:", e));
    }

    return NextResponse.json({
      generated: 2,
      scheduled_for: [seventh.toISOString(), twentyFirst.toISOString()],
    });
  } catch (error: any) {
    console.error("[generate-blog] error:", error);
    return NextResponse.json({ error: "Failed to generate", message: error?.message }, { status: 500 });
  }
}
