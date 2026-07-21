import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, reportRecipient } from "@/lib/resend";
import { siteUrl } from "@/lib/email/send";
import { COUNTRIES, SOUTH_AFRICA } from "@/lib/dealer-types";

export const runtime = "nodejs";

/**
 * Public "become a dealer" submissions.
 *
 * Inserted with the service-role client (there is no anon insert policy on
 * dealer_applications), so validation happens here in one place rather than
 * being trusted from the browser. Nothing the applicant sends can set the
 * status — it always starts 'pending' and only Diana can move it.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    // Fall back to South Africa for anything unrecognised — never trust the
    // client to send one of the four we actually support.
    const rawCountry = String(body.country ?? "").trim();
    const country = (COUNTRIES as readonly string[]).includes(rawCountry)
      ? rawCountry
      : SOUTH_AFRICA;
    const province = country === SOUTH_AFRICA ? String(body.province ?? "").trim() : "";
    const town = String(body.town ?? "").trim();
    const business = String(body.business ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Please give us your name and email address." },
        { status: 400 }
      );
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "That email address doesn't look right." },
        { status: 400 }
      );
    }
    // Cheap flood guard — the real defence is that this only writes a row.
    if (message.length > 2000 || name.length > 120) {
      return NextResponse.json({ error: "That's a bit long." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("dealer_applications").insert({
      name,
      email,
      phone,
      country,
      province,
      town,
      business,
      message,
      status: "pending",
    });
    if (error) throw error;

    // Best-effort: the application is saved either way, and Diana will see it
    // in the admin regardless of whether this email goes out.
    const to = reportRecipient();
    if (to) {
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      await sendEmail({
        to,
        subject: `Dealer application — ${name}${town ? `, ${town}` : ""}`,
        replyTo: email,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif; color:#2A2A2A; font-size:15px; line-height:1.6;">
            <p><strong>New dealer application</strong></p>
            <p>
              ${esc(name)}<br>
              ${esc(email)}<br>
              ${esc(phone) || "No phone given"}<br>
              ${esc([town, province, country].filter(Boolean).join(", ")) || "No area given"}
              ${business ? `<br>${esc(business)}` : ""}
            </p>
            ${message ? `<p style="white-space:pre-wrap;">${esc(message)}</p>` : ""}
            <p><a href="${siteUrl()}/admin/dealers/applications" style="color:#2F4A3C;">Review it in the admin</a></p>
          </div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[dealer-applications.post]", error);
    return NextResponse.json(
      { error: error?.message || "Could not send your application." },
      { status: 500 }
    );
  }
}
