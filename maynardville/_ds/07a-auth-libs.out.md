===FILE: lib/auth-tokens.ts===
import crypto from "node:crypto";
import type { StaffSession } from "@/lib/types";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

const SECRET = process.env.AUTH_SECRET;

function base64urlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Buffer {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to multiple of 4
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64");
}

export function signToken(payload: object, ttlSeconds: number): string {
  const exp = Date.now() + ttlSeconds * 1000;
  const data = { ...payload, exp };
  const payloadJson = JSON.stringify(data);
  const payloadB64 = base64urlEncode(Buffer.from(payloadJson, "utf-8"));

  const hmac = crypto.createHmac("sha256", SECRET).update(payloadB64).digest();
  const sigB64 = base64urlEncode(hmac);

  return `${payloadB64}.${sigB64}`;
}

export function verifyToken<T = any>(token: string): T | null {
  const dot = token.indexOf(".");
  if (dot === -1) return null;

  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  // Recompute signature
  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest();

  let providedSig: Buffer;
  try {
    providedSig = base64urlDecode(sigB64);
  } catch {
    return null;
  }

  if (
    expectedSig.length !== providedSig.length ||
    !crypto.timingSafeEqual(expectedSig, providedSig)
  ) {
    return null;
  }

  let payloadJson: string;
  try {
    payloadJson = base64urlDecode(payloadB64).toString("utf-8");
  } catch {
    return null;
  }

  let data: any;
  try {
    data = JSON.parse(payloadJson);
  } catch {
    return null;
  }

  // exp must be a number and not in the past
  if (typeof data.exp !== "number" || data.exp <= Date.now()) {
    return null;
  }

  return data as T;
}

// Convenience wrappers

export function createMagicToken(email: string): string {
  return signToken({ email }, 900); // 15 minutes
}

export function readMagicToken(token: string): { email: string } | null {
  return verifyToken<{ email: string; exp: number }>(token);
}

export function createSessionToken(s: StaffSession): string {
  return signToken({ id: s.id, name: s.name, role: s.role }, 60 * 60 * 12); // 12 hours
}

export function readSessionToken(token: string): StaffSession | null {
  return verifyToken<StaffSession>(token);
}
===END===
===FILE: lib/users.ts===
import type { StaffSession } from "@/lib/types";

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set");
}

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

export async function getUserByEmail(
  email: string
): Promise<StaffSession | null> {
  const safeEmail = email.toLowerCase().replace(/'/g, "\\'");
  const formula = `AND(LOWER({Email})='${safeEmail}',{Active}=1)`;
  const encodedFormula = encodeURIComponent(formula);
  const tableName = encodeURIComponent("Users");

  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableName}?filterByFormula=${encodedFormula}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable request failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const records = json.records as any[] | undefined;

  if (!records || records.length === 0) return null;

  const record = records[0];
  const fields = record.fields ?? {};

  return {
    id: record.id,
    name: fields["Name"] || email,
    role: fields["Role"] || "",
  };
}
===END===
===FILE: lib/email.ts===
interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via Resend in production, or logs to the console in dev.
 * Will also be used later for workflow notification emails.
 */
export async function sendMail({ to, subject, html }: SendMailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const from = process.env.EMAIL_FROM || "Maynardville <noreply@maynardville.co.za>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${res.status} ${err}`);
    }
  } else {
    // Dev / no API key: log the email content clearly
    console.log(`
------ DEV EMAIL ------
To: ${to}
Subject: ${subject}
HTML:
${html}
----------------------
`);
  }
}
===END===
===FILE: .env.example===
# Airtable Personal Access Token (PAT) with data.records:read/write + schema.bases:read/write
# All live in the Maynardville-owned Airtable account.
AIRTABLE_API_KEY=

# Airtable base ID for the Maynardville Open Air Theatre management base.
AIRTABLE_BASE_ID=

# Current season identifier, e.g. 2026
CURRENT_SEASON=2026

# Long random string used to sign magic-link and session tokens.
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
AUTH_SECRET=

# Optional Resend.com API key. If blank, magic-link emails are logged to the server console in dev.
RESEND_API_KEY=

# Default "from" address for emails (used by Resend).
EMAIL_FROM=Maynardville <noreply@maynardville.co.za>

# Quicket API credentials (later use).
QUICKET_API_KEY=
QUICKET_USER_TOKEN=

# Base URL of the deployed application (used for magic-link URLs).
# Defaults to http://localhost:3000 in development.
APP_BASE_URL=http://localhost:3000
===END===