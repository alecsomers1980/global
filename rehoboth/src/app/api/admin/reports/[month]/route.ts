import { NotAdminError, requireAdmin } from "@/lib/admin";
import { monthFromKey } from "@/lib/reports/period";
import { buildReport } from "@/lib/reports/build";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Renders a month's report inline without storing or sending it — how the AI
 * summary is reviewed (?ai=1) before REPORT_AI_SUMMARY is switched on.
 * Admin token in the Authorization header, as every admin action takes it.
 */
export async function GET(request: Request, { params }: { params: Promise<{ month: string }> }) {
  try {
    await requireAdmin((request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, ""));
  } catch (e) {
    if (e instanceof NotAdminError) return new Response("Unauthorized", { status: 401 });
    throw e;
  }

  let period;
  try {
    period = monthFromKey((await params).month);
  } catch {
    return new Response("Not a month", { status: 400 });
  }

  const ai = new URL(request.url).searchParams.get("ai") === "1";
  const { pdf } = await buildReport(period, { ai });
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Rehoboth-Report-${period.key}-preview.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
