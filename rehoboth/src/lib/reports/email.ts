import { Resend } from "resend";
import type { ReportPeriod } from "./period";

/**
 * Sends a stored report. Returns who it went to, or throws with the reason —
 * the caller records either on the monthly_reports row, and a failure never
 * undoes the report itself, which is already in the admin.
 */

const FROM = "Rehoboth Herbal Co. <orders@rehobothherbal.co.za>";

export async function emailReport(period: ReportPeriod, pdf: Buffer): Promise<string[]> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO?.trim();
  if (!key) throw new Error("RESEND_API_KEY not set");
  if (!to) throw new Error("REPORT_TO not set");
  const cc = process.env.REPORT_CC?.trim();

  const { error } = await new Resend(key).emails.send({
    from: FROM,
    to,
    ...(cc ? { cc } : {}),
    subject: `Rehoboth Herbal Co. — ${period.label} report`,
    text: `Your website and shop report for ${period.label} is attached.\nIt is also kept in the admin under Reports, with every earlier month.`,
    attachments: [{ filename: `Rehoboth-Report-${period.key}.pdf`, content: pdf }],
  });
  if (error) throw new Error(error.message);
  return cc ? [to, cc] : [to];
}
