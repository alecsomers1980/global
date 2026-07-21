import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Publishes APPROVED Journal posts whose scheduled_for has passed (or that have
 * no schedule — publish immediately once Diana approves). Runs daily; see vercel.json.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: due, error: fetchError } = await admin
      .from("blog_posts")
      .select("id")
      .eq("status", "approved")
      .or(`scheduled_for.is.null,scheduled_for.lte.${now}`);

    if (fetchError) throw fetchError;
    if (!due || due.length === 0) {
      return NextResponse.json({ published: 0, message: "No posts due" });
    }

    const ids = due.map((p) => p.id as string);
    const { error: updateError } = await admin
      .from("blog_posts")
      .update({ status: "published", published_at: now })
      .in("id", ids);

    if (updateError) throw updateError;

    return NextResponse.json({ published: ids.length, ids });
  } catch (error: any) {
    console.error("[publish-blog] error:", error);
    return NextResponse.json({ error: "Failed to publish", message: error?.message }, { status: 500 });
  }
}
