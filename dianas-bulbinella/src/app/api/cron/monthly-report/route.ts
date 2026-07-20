import React from "react";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { buildMonthlyReport } from "@/lib/report/build";
import { sendEmail, reportRecipient } from "@/lib/resend";
import { siteUrl } from "@/lib/email/send";
import { zar } from "@/lib/pdf/zar";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Emails Diana last month's sales report as a PDF. Scheduled for the 1st of
 * each month (see vercel.json).
 *
 * `?month=YYYY-MM` builds a specific month instead — handy for testing and for
 * re-sending a report that bounced.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const to = reportRecipient();
    if (!to) {
      return NextResponse.json(
        { error: "REPORT_RECIPIENT_EMAIL is not configured." },
        { status: 500 }
      );
    }

    // Default: last month. ?month=YYYY-MM overrides.
    const monthParam = req.nextUrl.searchParams.get("month");
    let ref: Date | undefined;
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      if (!year || !month || month < 1 || month > 12) {
        return NextResponse.json(
          { error: "month must look like 2026-06" },
          { status: 400 }
        );
      }
      ref = new Date(year, month - 1, 1);
    }

    const report = await buildMonthlyReport(ref);

    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: MonthlyReportDocument } = await import(
      "@/lib/report/MonthlyReportDocument"
    );

    // Cast at the boundary: renderToBuffer is typed to ReactElement<DocumentProps>
    // and our component's props don't structurally match that.
    const element = React.createElement(MonthlyReportDocument, { report });
    const pdf = await renderToBuffer(element as any);

    const trend =
      report.salesChangePct === null
        ? "No comparison available for last month."
        : `Sales ${report.salesChangePct >= 0 ? "up" : "down"} ${Math.abs(
            report.salesChangePct
          ).toFixed(1)}% on the month before.`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif; color:#2A2A2A; font-size:15px; line-height:1.6;">
        <p>Morning Diana,</p>
        <p>Here&#39;s how ${report.label} went:</p>
        <ul>
          <li><strong>${zar(report.totalSales)}</strong> in sales across ${
            report.orderCount
          } ${report.orderCount === 1 ? "order" : "orders"}</li>
          <li>Average order: <strong>${zar(report.averageOrderValue)}</strong></li>
          <li>${report.newCustomers} new ${
            report.newCustomers === 1 ? "customer" : "customers"
          }, ${report.repeatCustomers} returning</li>
        </ul>
        <p>${trend}</p>
        <p>The attached PDF has the full breakdown — top products, and every customer with what they bought.</p>
        <p style="color:#6B7280; font-size:13px;">
          <a href="${siteUrl()}/admin/orders" style="color:#2F4A3C;">Open the admin</a>
        </p>
      </div>`;

    const filename = `dianas-report-${report.label
      .toLowerCase()
      .replace(/\s+/g, "-")}.pdf`;

    const result = await sendEmail({
      to,
      subject: `Diana's Bulbinella — ${report.label} sales report`,
      html,
      attachments: [{ filename, content: pdf }],
    });

    if (!result.success) {
      // 500 so a failed send shows up as a failed cron run rather than silently
      // passing.
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      month: report.label,
      orders: report.orderCount,
      sales: report.totalSales,
      sentTo: to,
    });
  } catch (error: any) {
    console.error("[cron.monthly-report]", error);
    return NextResponse.json(
      { error: error?.message || "Could not build the report." },
      { status: 500 }
    );
  }
}
