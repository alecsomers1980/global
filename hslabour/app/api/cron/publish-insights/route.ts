import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
    const now = new Date().toISOString();

    const { data: due } = await supabase
      .from("insights_posts")
      .select("id")
      .eq("status", "APPROVED")
      .lte("scheduled_for", now);

    const ids = (due ?? []).map((p: { id: string }) => p.id);
    if (ids.length === 0) {
      return NextResponse.json({ published: 0, message: "Nothing due" });
    }

    const { error } = await supabase
      .from("insights_posts")
      .update({ status: "PUBLISHED", published_at: now })
      .in("id", ids);
    if (error) throw error;

    return NextResponse.json({ published: ids.length, ids });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[publish-insights]", message);
    return NextResponse.json(
      { error: "Failed to publish insights", message },
      { status: 500 },
    );
  }
}
