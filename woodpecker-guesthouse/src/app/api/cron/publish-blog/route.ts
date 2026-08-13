import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const nowIso = new Date().toISOString();
    const { data: due, error: selectError } = await supabase
      .from("blog_posts")
      .select("id, slug")
      .eq("status", "approved")
      .lte("scheduled_for", nowIso);

    if (selectError) throw new Error(selectError.message);
    if (!due || due.length === 0) {
      return NextResponse.json({ published: 0 });
    }

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ status: "published", published_at: nowIso })
      .in(
        "id",
        due.map((p) => p.id)
      );
    if (updateError) throw new Error(updateError.message);

    revalidatePath("/blog");
    for (const post of due) revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ published: due.length, postIds: due.map((p) => p.id) });
  } catch (error: any) {
    console.error("[publish-blog] Error:", error);
    return NextResponse.json({ error: "Failed to publish blog posts", message: error?.message }, { status: 500 });
  }
}