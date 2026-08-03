import { sendMail } from "@/lib/email";

// ---- Airtable helpers ----

async function aGet(pathAndQuery: string): Promise<any> {
  const base = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
  const url = `${base}/${pathAndQuery}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

function appUrl(path: string): string {
  return `${process.env.APP_BASE_URL || "http://localhost:3000"}${path}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---- Context loader ----

interface CompContext {
  id: string;
  guestName: string;
  guestSurname: string;
  guestEmail?: string;
  houseSeats: boolean;
  notes?: string;
  seats: number;
  status: string;
  seatNumbers?: string;
  ticketReference?: string;
  performanceName: string;
  categoryName: string;
  requesterName: string;
  requesterEmail?: string;
}

async function loadContext(compRequestId: string): Promise<CompContext> {
  const record = await aGet(`Comp Requests/${encodeURIComponent(compRequestId)}`);
  const f = record.fields;

  // Resolve linked records
  let performanceName = "the performance";
  if (f.Performance && f.Performance.length > 0) {
    const perfRecord = await aGet(`Performances/${encodeURIComponent(f.Performance[0])}`);
    if (perfRecord.fields) {
      const label = perfRecord.fields["Performance Label"];
      const prod = perfRecord.fields["Production/Event"];
      performanceName = label || prod || performanceName;
    }
  }

  let categoryName = "";
  if (f.Category && f.Category.length > 0) {
    const catRecord = await aGet(`Categories/${encodeURIComponent(f.Category[0])}`);
    categoryName = catRecord.fields?.["Category Name"] || "";
  }

  let requesterName = "";
  let requesterEmail: string | undefined = undefined;
  if (f.Requester && f.Requester.length > 0) {
    const reqRecord = await aGet(`Requesters/${encodeURIComponent(f.Requester[0])}`);
    requesterName = reqRecord.fields?.["Name"] || "";
    requesterEmail = reqRecord.fields?.["Email"] || undefined;
  }

  return {
    id: record.id,
    guestName: f["Guest Name"] || "",
    guestSurname: f["Guest Surname"] || "",
    guestEmail: f["Guest Email"] || undefined,
    houseSeats: !!f["House Seats"],
    notes: f["Notes"] || undefined,
    seats: f["Total Seats Requested"] || 0,
    status: f["Ticket Status"] || "",
    seatNumbers: f["Seat Numbers"] || undefined,
    ticketReference: f["Ticket Reference"] || undefined,
    performanceName,
    categoryName,
    requesterName,
    requesterEmail,
  };
}

// ---- Recipient helpers ----

async function getApproverEmails(): Promise<string[]> {
  try {
    const formula = encodeURIComponent("AND({Can Approve}=1,{Active}=1)");
    const data = await aGet(`Users?filterByFormula=${formula}`);
    const emails = (data.records || [])
      .map((r: any) => r.fields?.Email)
      .filter(Boolean) as string[];
    if (emails.length > 0) return emails;
  } catch (e) {
    console.error("Failed to fetch approver emails from Airtable", e);
  }
  // Fallback
  return (process.env.NOTIFY_APPROVERS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

async function getBoxOfficeEmails(): Promise<string[]> {
  try {
    const formula = encodeURIComponent("AND({Role}='Box Office',{Active}=1)");
    const data = await aGet(`Users?filterByFormula=${formula}`);
    const emails = (data.records || [])
      .map((r: any) => r.fields?.Email)
      .filter(Boolean) as string[];
    if (emails.length > 0) return emails;
  } catch (e) {
    console.error("Failed to fetch box office emails from Airtable", e);
  }
  return (process.env.NOTIFY_BOXOFFICE || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

// ---- Email sending wrapper ----

async function send(to: string | undefined, subject: string, html: string): Promise<void> {
  if (!to) return;
  await sendMail({ to, subject, html });
}

// ---- Details block builder ----

function buildDetailsHtml(ctx: CompContext): string {
  const guest = `${ctx.guestName} ${ctx.guestSurname}`;
  return `
    <p><strong>Requester:</strong> ${escapeHtml(ctx.requesterName)} (${escapeHtml(ctx.requesterEmail || "no email")})</p>
    <p><strong>Guest:</strong> ${escapeHtml(guest)}</p>
    <p><strong>Performance:</strong> ${escapeHtml(ctx.performanceName)}</p>
    <p><strong>Category:</strong> ${escapeHtml(ctx.categoryName)}</p>
    <p><strong>Guest Email:</strong> ${escapeHtml(ctx.guestEmail || "not provided")}</p>
    <p><strong>House Seats:</strong> ${ctx.houseSeats ? "Yes" : "No"}</p>
    <p><strong>Seats:</strong> ${ctx.seats}</p>
    ${ctx.notes ? `<p><strong>Notes:</strong> ${escapeHtml(ctx.notes)}</p>` : ""}
    <p><strong>Status:</strong> ${escapeHtml(ctx.status)}</p>
  `;
}

function styledEmail(heading: string, content: string, actionLink?: { text: string; url: string }): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #2b6cb0;">${heading}</h2>
      ${content}
      ${actionLink ? `<p><a href="${actionLink.url}" style="display: inline-block; padding: 10px 20px; background: #2b6cb0; color: white; text-decoration: none; border-radius: 5px;">${actionLink.text}</a></p>` : ""}
    </div>
  `;
}

// ---- Exported notification functions ----

export async function notifySubmitted(compRequestId: string): Promise<void> {
  try {
    const ctx = await loadContext(compRequestId);
    const guest = `${ctx.guestName} ${ctx.guestSurname}`;
    const details = buildDetailsHtml(ctx);

    // Notify each approver
    const approverEmails = await getApproverEmails();
    const approverBody = styledEmail(
      `New comp request to approve — ${guest} (${ctx.performanceName})`,
      details + `<p><a href="${appUrl("/approvals")}">View Approvals</a></p>`
    );
    await Promise.all(approverEmails.map(email => send(email, approverBody, "")));

    // Notify requester
    const requesterBody = styledEmail(
      `We’ve received your request — ${ctx.performanceName}`,
      `<p>Thank you, we’ve received your comp request for <strong>${escapeHtml(guest)}</strong> for <strong>${escapeHtml(ctx.performanceName)}</strong>. We’ll update you when it’s reviewed.</p>`
    );
    await send(ctx.requesterEmail, requesterBody, "");
  } catch (e) {
    console.error("notifySubmitted failed", e);
  }
}

export async function notifyApproved(compRequestId: string): Promise<void> {
  try {
    const ctx = await loadContext(compRequestId);
    const guest = `${ctx.guestName} ${ctx.guestSurname}`;
    const details = buildDetailsHtml(ctx);

    // Notify box office
    const boxOfficeEmails = await getBoxOfficeEmails();
    const boxOfficeBody = styledEmail(
      `Ready to issue — ${guest} (${ctx.performanceName})`,
      details + `<p><a href="${appUrl("/box-office")}">Box Office</a></p>`
    );
    await Promise.all(boxOfficeEmails.map(email => send(email, boxOfficeBody, "")));

    // Notify requester
    const requesterBody = styledEmail(
      `Your comp request was approved — ${ctx.performanceName}`,
      `<p>Good news! Your comp request for <strong>${escapeHtml(guest)}</strong> to <strong>${escapeHtml(ctx.performanceName)}</strong> has been approved. The box office will issue the tickets shortly.</p>`
    );
    await send(ctx.requesterEmail, requesterBody, "");
  } catch (e) {
    console.error("notifyApproved failed", e);
  }
}

export async function notifyDeclined(compRequestId: string, reason: string): Promise<void> {
  try {
    const ctx = await loadContext(compRequestId);
    const guest = `${ctx.guestName} ${ctx.guestSurname}`;
    const body = styledEmail(
      `Update on your comp request — ${ctx.performanceName}`,
      `<p>We’re sorry, but your comp request for <strong>${escapeHtml(guest)}</strong> to <strong>${escapeHtml(ctx.performanceName)}</strong> could not be fulfilled.</p>
       <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>`
    );
    await send(ctx.requesterEmail, body, "");
  } catch (e) {
    console.error("notifyDeclined failed", e);
  }
}

export async function notifyIssued(compRequestId: string): Promise<void> {
  try {
    const ctx = await loadContext(compRequestId);
    const guest = `${ctx.guestName} ${ctx.guestSurname}`;
    const body = styledEmail(
      `Tickets issued — ${ctx.performanceName}`,
      `<p>Your tickets have been issued for <strong>${escapeHtml(guest)}</strong> to <strong>${escapeHtml(ctx.performanceName)}</strong>.</p>
       <p><strong>Seat Numbers:</strong> ${escapeHtml(ctx.seatNumbers || "N/A")}</p>
       <p><strong>Ticket Reference:</strong> ${escapeHtml(ctx.ticketReference || "N/A")}</p>`
    );
    await send(ctx.requesterEmail, body, "");
  } catch (e) {
    console.error("notifyIssued failed", e);
  }
}

export async function notifyMissingData(items: { id: string; guest: string; performance: string; seatNumbers: string; ticketReference: string }[]): Promise<void> {
  if (!items.length) return;
  try {
    const [approverEmails, boxOfficeEmails] = await Promise.all([getApproverEmails(), getBoxOfficeEmails()]);
    const recipients = Array.from(new Set([...approverEmails, ...boxOfficeEmails]));

    const listItems = items.map(item => {
      const missing: string[] = [];
      if (!item.seatNumbers) missing.push("Seat Numbers");
      if (!item.ticketReference) missing.push("Ticket Reference");
      return `<li><strong>${escapeHtml(item.guest)}</strong> — ${escapeHtml(item.performance)} (missing: ${missing.join(", ")})</li>`;
    }).join("");

    const body = styledEmail(
      "Action needed — issued comps missing details",
      `<p>The following issued comp requests are missing seat numbers and/or ticket references:</p><ul>${listItems}</ul><p>Please update them in the system.</p>`
    );

    await Promise.all(recipients.map(email => send(email, body, "")));
  } catch (e) {
    console.error("notifyMissingData failed", e);
  }
}