import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendFollowUpReport } from "@/lib/email";

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Find all enquiries where follow_up_date is today or earlier,
    // AND status is NOT confirmed (confirmed jobs don't need follow-up)
    const { data: enquiries, error } = await supabase
      .from("enquiries")
      .select("*")
      .lte("follow_up_date", today)
      .neq("status", "confirmed")
      .order("priority", { ascending: false })
      .order("follow_up_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!enquiries || enquiries.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No follow-ups due today",
        date: today,
      });
    }

    const result = await sendFollowUpReport(enquiries);

    return NextResponse.json({
      success: result.success,
      sent: result.success ? enquiries.length : 0,
      error: result.error,
      date: today,
      highPriority: enquiries.filter((e) => e.priority === "high").length,
    });
  } catch (error: any) {
    console.error("Cron check-followups error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
