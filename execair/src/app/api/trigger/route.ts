import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendFollowUpReport } from "@/lib/email";
import { isAdminRequest } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const cronAuth = req.headers.get("authorization") || "";
  const isCron = !!process.env.CRON_SECRET && cronAuth === `Bearer ${process.env.CRON_SECRET}`;
  const isAdmin = !isCron && (await isAdminRequest(req));

  if (!isAdmin && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const today = body.date || new Date().toISOString().split("T")[0];

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
        message: "No follow-ups due",
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
