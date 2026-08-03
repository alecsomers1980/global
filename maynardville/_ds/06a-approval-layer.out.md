===FILE: lib/types.ts===
export interface Category {
  id: string;
  name: string;
}

export interface Performance {
  id: string;
  label: string;
  date: string;     // ISO date string
  time: string;
  venue: string;
  performanceType: string;
  season: string;
}

export interface Requester {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedCategoryIds: string[]; // IDs of categories they can request for
}

export interface CompRequestInput {
  guestName: string;
  guestSurname: string;
  performanceId: string;       // linked Performance record ID
  categoryId: string;          // linked Category record ID
  guestEmail: string;
  houseSeats: boolean;
  notes: string;
  totalSeats: number;
  requesterId: string;         // linked Requester record ID
}

export interface CompRequestRow {
  id: string;
  guestName: string;
  guestSurname: string;
  guestEmail: string;
  performance: string; // resolved label from Performance
  category: string;    // resolved name from Category
  requester: string;   // resolved name from Requester
  totalSeats: number;
  houseSeats: boolean;
  notes: string;
  status: string;
  seatNumbers: string;
  ticketReference: string;
  approvedAt: string;
  submittedAt: string;
}

export interface StaffSession {
  id: string;
  name: string;
  role: "Admin" | "Box Office" | string;
}
===END===

===FILE: lib/comps.ts===
const apiKey = process.env.AIRTABLE_API_KEY!;
const baseId = process.env.AIRTABLE_BASE_ID!;
const apiUrl = `https://api.airtable.com/v0/${baseId}`;

async function cFetch(pathAndQuery: string, init?: RequestInit): Promise<Response> {
  const url = `${apiUrl}/${pathAndQuery}`;
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
    cFetch("Performances?fields[]=Production/Event&fields[]=Performance Label"),
    cFetch("Categories?fields[]=Category Name"),
    cFetch("Requesters?fields[]=Name"),
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
===END===

===FILE: lib/session.ts===
// DEV-ONLY staff identity stub.
// This will be replaced by Auth.js in Phase 2.
// The cookie is unsigned and for development only.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { StaffSession } from "@/lib/types";

const COOKIE_NAME = "mv_staff";

/**
 * Read the dev session from the request cookies (Server Component context).
 */
export function getStaffSession(): StaffSession | null {
  const cookieStore = cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return parsed as StaffSession;
  } catch {
    return null;
  }
}

/**
 * Require a valid session; redirect to /staff-login if missing,
 * or to /dashboard if the role is not allowed.
 */
export function requireStaff(allowedRoles?: string[]): StaffSession {
  const session = getStaffSession();
  if (!session) redirect("/staff-login");
  if (allowedRoles && !allowedRoles.includes(session.role)) redirect("/dashboard");
  return session;
}

/**
 * Parse the same cookie from an incoming web Request (for API routes).
 */
export function getStaffFromRequest(req: Request): StaffSession | null {
  const cookieHeader = req.headers.get("Cookie") || "";
  const found = cookieHeader
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!found) return null;
  const value = found.split("=").slice(1).join("=");
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return parsed as StaffSession;
  } catch {
    return null;
  }
}
===END===

===FILE: app/staff-login/page.tsx===
export default function StaffLoginPage() {
  return (
    <main className="min-h-screen bg-[#001f3f] text-[#f5f5dc] flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-lg bg-white/10 backdrop-blur">
        <h1 className="text-3xl font-bold mb-2">Staff sign-in (dev)</h1>
        <p className="mb-6 text-sm opacity-90">
          This is a temporary role picker for development. It will be replaced by Auth.js in Phase 2.
        </p>

        <div className="space-y-4">
          <form method="POST" action="/api/staff-login">
            <input type="hidden" name="role" value="Admin" />
            <input type="hidden" name="name" value="Jaco" />
            <button
              type="submit"
              className="w-full py-3 rounded font-semibold bg-[#e6dcc3] text-[#001f3f] hover:bg-[#f5f5dc] transition"
            >
              Continue as Jaco (Admin)
            </button>
          </form>

          <form method="POST" action="/api/staff-login">
            <input type="hidden" name="role" value="Box Office" />
            <input type="hidden" name="name" value="Jeff" />
            <button
              type="submit"
              className="w-full py-3 rounded font-semibold bg-[#e6dcc3] text-[#001f3f] hover:bg-[#f5f5dc] transition"
            >
              Continue as Jeff (Box Office)
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs opacity-70">
          The session is stored in an unsigned cookie for convenience and must not be used in production.
        </p>
      </div>
    </main>
  );
}
===END===

===FILE: app/api/staff-login/route.ts===
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = (formData.get("role") as string) || "Box Office";
  const name = (formData.get("name") as string) || "Dev";

  const id = name.toLowerCase().replace(/\s+/g, "-");
  const session = { id, name, role };
  const cookieValue = encodeURIComponent(JSON.stringify(session));

  const response = NextResponse.redirect(new URL("/dashboard", request.url), {
    status: 303,
  });
  response.cookies.set("mv_staff", cookieValue, {
    httpOnly: true,
    path: "/",
  });
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/staff-login", request.url), {
    status: 303,
  });
  // Clear the cookie
  response.cookies.set("mv_staff", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
===END===