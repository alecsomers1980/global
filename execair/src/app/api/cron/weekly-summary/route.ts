import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

function formatCurrency(n: number) {
  return `R ${n.toLocaleString()}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Calculate last week (Mon 00:00 to Sun 23:59)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 8 : 1; // If Sunday, go back to previous Monday
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const lastWeekStart = lastMonday.toISOString();
    const lastWeekEnd = lastSunday.toISOString();

    // Query all enquiries from last week
    const { data: weekEnquiries, error: weekErr } = await supabase
      .from("enquiries")
      .select("*")
      .gte("created_at", lastWeekStart)
      .lte("created_at", lastWeekEnd)
      .order("created_at", { ascending: false });

    if (weekErr) return NextResponse.json({ error: weekErr.message }, { status: 500 });

    // Query current outstanding follow-ups
    const today = now.toISOString().split("T")[0];
    const { data: outstanding } = await supabase
      .from("enquiries")
      .select("*")
      .lte("follow_up_date", today)
      .neq("status", "confirmed")
      .order("priority", { ascending: false });

    // All-time totals
    const { data: allEnquiries } = await supabase.from("enquiries").select("quote_value, status, actual_value");

    const all = weekEnquiries || [];
    const outstandingList = outstanding || [];
    const allList = allEnquiries || [];

    const stats = {
      weekTotal: all.length,
      weekWarmLeads: all.filter((e) => e.status === "warm_lead").length,
      weekConfirmed: all.filter((e) => e.status === "confirmed").length,
      weekOnHold: all.filter((e) => e.status === "on_hold").length,
      weekNoAnswer: all.filter((e) => e.status === "no_answer").length,
      weekHighPriority: all.filter((e) => e.priority === "high").length,
      weekQuoteValue: all.reduce((sum, e) => sum + (e.quote_value || 0), 0),
      weekActualValue: all.reduce((sum, e) => sum + ((e as any).actual_value || 0), 0),
      allTimeConfirmed: allList.filter((e) => e.status === "confirmed").length,
      allTimeQuoteValue: allList.reduce((sum, e) => sum + (e.quote_value || 0), 0),
      allTimeActualValue: allList.reduce((sum, e) => sum + ((e as any).actual_value || 0), 0),
      outstanding: outstandingList.length,
      outstandingHigh: outstandingList.filter((e) => e.priority === "high").length,
    };

    // Build HTML email
    const topNew = all.filter((e) => e.priority === "high").slice(0, 5);

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7; padding:40px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);">

<tr><td style="background:#0a1628; padding:32px 40px; text-align:center;">
<h1 style="color:#0097b2; font-size:20px; margin:0; letter-spacing:1px;">Exec-Air</h1>
<p style="color:#94a3b8; font-size:12px; margin:6px 0 0; letter-spacing:2px; text-transform:uppercase;">Weekly Summary Report</p>
</td></tr>

<tr><td style="background:#0097b2; padding:16px 40px;">
<p style="color:#fff; font-size:14px; margin:0;">
Week of ${lastMonday.toLocaleDateString("en-ZA")} — ${lastSunday.toLocaleDateString("en-ZA")}
</p>
</td></tr>

<tr><td style="padding:24px 40px;">

<h2 style="color:#0a1628; font-size:16px; margin:0 0 16px;">📊 Weekly Overview</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-bottom:24px;">
<tr style="background:#f9fafb;">
<td style="padding:8px 16px; font-weight:600; border-bottom:1px solid #e5e7eb;">Metric</td>
<td style="padding:8px 16px; text-align:right; font-weight:700; border-bottom:1px solid #e5e7eb;">Value</td>
</tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">Total Enquiries</td><td style="padding:8px 16px; text-align:right; font-weight:600; border-bottom:1px solid #f3f4f6;">${stats.weekTotal}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">Warm Leads</td><td style="padding:8px 16px; text-align:right; font-weight:600; color:#d97706; border-bottom:1px solid #f3f4f6;">${stats.weekWarmLeads}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">Confirmed Jobs</td><td style="padding:8px 16px; text-align:right; font-weight:600; color:#059669; border-bottom:1px solid #f3f4f6;">${stats.weekConfirmed}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">On Hold</td><td style="padding:8px 16px; text-align:right; font-weight:600; color:#7c3aed; border-bottom:1px solid #f3f4f6;">${stats.weekOnHold}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">No Answer</td><td style="padding:8px 16px; text-align:right; font-weight:600; color:#6b7280; border-bottom:1px solid #f3f4f6;">${stats.weekNoAnswer}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">High Priority</td><td style="padding:8px 16px; text-align:right; font-weight:600; color:#dc2626; border-bottom:1px solid #f3f4f6;">${stats.weekHighPriority}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #e5e7eb;">Quote Value</td><td style="padding:8px 16px; text-align:right; font-weight:700; border-bottom:1px solid #e5e7eb;">${formatCurrency(stats.weekQuoteValue)}</td></tr>
${stats.weekActualValue > 0 ? `<tr><td style="padding:8px 16px; border-bottom:1px solid #e5e7eb; color:#059669;">Actual Revenue</td><td style="padding:8px 16px; text-align:right; font-weight:700; color:#059669; border-bottom:1px solid #e5e7eb;">${formatCurrency(stats.weekActualValue)}</td></tr>` : ""}
</table>

<h2 style="color:#0a1628; font-size:16px; margin:24px 0 16px;">🏢 All-Time Totals</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-bottom:24px;">
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">Total Confirmed Jobs</td><td style="padding:8px 16px; text-align:right; font-weight:600; border-bottom:1px solid #f3f4f6;">${stats.allTimeConfirmed}</td></tr>
<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">All-Time Quote Value</td><td style="padding:8px 16px; text-align:right; font-weight:600; border-bottom:1px solid #f3f4f6;">${formatCurrency(stats.allTimeQuoteValue)}</td></tr>
${stats.allTimeActualValue > 0 ? `<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6; color:#059669;">All-Time Revenue</td><td style="padding:8px 16px; text-align:right; font-weight:700; color:#059669; border-bottom:1px solid #f3f4f6;">${formatCurrency(stats.allTimeActualValue)}</td></tr>` : ""}
</table>

<h2 style="color:#dc2626; font-size:16px; margin:24px 0 16px;">⚠️ Outstanding Follow-ups — ${stats.outstanding} total (${stats.outstandingHigh} high priority)</h2>
${topNew.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
<tr style="background:#f9fafb;"><th style="padding:8px 16px; text-align:left; font-size:11px; text-transform:uppercase; color:#6b7280;">Customer</th><th style="padding:8px 16px; text-align:left; font-size:11px; text-transform:uppercase; color:#6b7280;">Status</th></tr>
${topNew.map((e: any) => `<tr><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">${e.customer_name}${e.company ? ` — ${e.company}` : ""}</td><td style="padding:8px 16px; border-bottom:1px solid #f3f4f6;">${e.status}</td></tr>`).join("")}
</table>` : "<p style='color:#6b7280;'>None pending — excellent!</p>"}

</td></tr>

<tr><td style="background:#f9fafb; padding:20px 40px; border-top:1px solid #e5e7eb; text-align:center;">
<a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/admin" style="font-size:13px; color:#0097b2; text-decoration:none; font-weight:600;">View Full Dashboard →</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder") {
      await resend.emails.send({
        from: "Exec-Air <noreply@execair.co.za>",
        to: process.env.NOTIFICATION_EMAIL || "info@execair.co.za",
        subject: `📊 Exec-Air Weekly Summary — ${lastMonday.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} to ${lastSunday.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`,
        html,
      });
    } else {
      console.log("Resend not configured — weekly email skipped");
    }

    return NextResponse.json({
      success: true,
      stats,
      period: { start: lastWeekStart, end: lastWeekEnd },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
