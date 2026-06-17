import type { CompRequestRow } from "./types";

function getAirtableEnv() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    throw new Error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set");
  }
  return { apiKey, apiUrl: `https://api.airtable.com/v0/${baseId}` };
}

async function cFetch(pathAndQuery: string, init?: RequestInit): Promise<Response> {
  const { apiKey, apiUrl } = getAirtableEnv();
  
  // Encode each path segment (table names like "Comp Requests" contain spaces);
  // leave the query string (already encoded by callers) intact.
  const [rawPath, qs] = pathAndQuery.split("?");
  const encodedPath = rawPath.split("/").map(encodeURIComponent).join("/");
  const url = `${apiUrl}/${encodedPath}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable error ${res.status}: ${body}`);
  }
  return res;
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
}

function orFormula(field: string, values: string[]): string {
  const conditions = values.map(v => `{${field}}='${v.replace(/'/g,"\\'")}'`);
  return `OR(${conditions.join(",")})`;
}

export async function listCompRequestRows(statuses: string[]): Promise<CompRequestRow[]> {
  // 1. Fetch all Comp Requests filtered by Ticket Status
  const filter = orFormula("Ticket Status", statuses);
  const query = `Comp Requests?filterByFormula=${encodeURIComponent(filter)}`;
  const res = await cFetch(query);
  const compRecords: AirtableRecord[] = (await res.json()).records;

  // 2. Fetch all Performances, Categories, Requesters (only id + needed fields)
  const [perfRes, catRes, reqRes] = await Promise.all([
    cFetch("Performances"),
    cFetch("Categories"),
    cFetch("Requesters"),
  ]);

  const performances: AirtableRecord[] = (await perfRes.json()).records;
  const categories: AirtableRecord[] = (await catRes.json()).records;
  const requesters: AirtableRecord[] = (await reqRes.json()).records;

  // Maps id -> resolved string
  const perfMap = new Map<string, string>();
  performances.forEach(p => {
    const label = p.fields["Performance Label"] || p.fields["Production/Event"] || "";
    perfMap.set(p.id, label);
  });
  const catMap = new Map<string, string>();
  categories.forEach(c => {
    catMap.set(c.id, c.fields["Category Name"] || "");
  });
  const reqMap = new Map<string, string>();
  requesters.forEach(r => {
    reqMap.set(r.id, r.fields["Name"] || "");
  });

  // 3. Map to CompRequestRow
  const rows: CompRequestRow[] = compRecords.map(rec => {
    const f = rec.fields;
    const performanceId: string = Array.isArray(f.Performance) && f.Performance.length ? f.Performance[0] : "";
    const categoryId: string = Array.isArray(f.Category) && f.Category.length ? f.Category[0] : "";
    const requesterId: string = Array.isArray(f.Requester) && f.Requester.length ? f.Requester[0] : "";

    return {
      id: rec.id,
      guestName: f["Guest Name"] || "",
      guestSurname: f["Guest Surname"] || "",
      guestEmail: f["Guest Email"] || "",
      performance: perfMap.get(performanceId) || "",
      category: catMap.get(categoryId) || "",
      requester: reqMap.get(requesterId) || "",
      totalSeats: f["Total Seats Requested"] ?? 0,
      houseSeats: !!f["House Seats"],
      notes: f.Notes || "",
      status: f["Ticket Status"] || "",
      seatNumbers: f["Seat Numbers"] || "",
      ticketReference: f["Ticket Reference"] || "",
      approvedAt: f["Approved At"] || "",
      submittedAt: rec.createdTime,
    };
  });

  // Sort by submittedAt ascending
  rows.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  return rows;
}

export async function approveRequest(id: string, staffName: string): Promise<void> {
  await cFetch(`Comp Requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        "Ticket Status": "TO ISSUE",
        "Approved At": new Date().toISOString(),
      },
    }),
  });

  await appendApprovalLog({
    compRequestId: id,
    action: "Approved",
    fromStatus: "REQUEST",
    toStatus: "TO ISSUE",
    note: `Approved by ${staffName}`,
    summary: "Approved",
  });
}

export async function declineRequest(id: string, staffName: string, reason: string): Promise<void> {
  await cFetch(`Comp Requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        "Ticket Status": "DECLINED",
      },
    }),
  });

  await appendApprovalLog({
    compRequestId: id,
    action: "Declined",
    fromStatus: "REQUEST",
    toStatus: "DECLINED",
    note: reason,
    summary: "Declined",
  });
}

export async function issueRequest(
  id: string,
  staffName: string,
  seatNumbers: string,
  ticketReference: string,
): Promise<void> {
  if (!seatNumbers || !ticketReference) {
    throw new Error("Seat numbers and ticket reference are required to issue tickets.");
  }

  await cFetch(`Comp Requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        "Seat Numbers": seatNumbers,
        "Ticket Reference": ticketReference,
        "Ticket Status": "ISSUED",
      },
    }),
  });

  await appendApprovalLog({
    compRequestId: id,
    action: "Issued",
    fromStatus: "TO ISSUE",
    toStatus: "ISSUED",
    note: `Issued by ${staffName} — seats ${seatNumbers}, ref ${ticketReference}`,
    summary: "Issued",
  });
}

interface AppendLogParams {
  compRequestId: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  note: string;
  summary?: string;
}

async function appendApprovalLog(params: AppendLogParams): Promise<void> {
  await cFetch("Approval Log", {
    method: "POST",
    body: JSON.stringify({
      fields: {
        "Summary": params.summary || params.action,
        "Action": params.action,
        "From Status": params.fromStatus,
        "To Status": params.toStatus,
        "Note": params.note,
        "Related Comp Request": [params.compRequestId],
      },
    }),
  });
}