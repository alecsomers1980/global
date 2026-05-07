import { NextResponse } from "next/server";

const SESSION_COOKIE = "admin-session";
const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET (or ADMIN_SESSION_SECRET) is missing or too short (min 16 chars)");
  }
  return secret;
}

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return b64urlEncode(sig);
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

interface SessionPayload {
  sub: "admin";
  iat: number;
  exp: number;
}

export async function createSessionToken(maxAgeSeconds: number): Promise<string> {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: "admin", iat: now, exp: now + maxAgeSeconds };
  const body = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const sig = await hmac(body, secret);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  const expected = await hmac(body, secret);
  if (!timingSafeEq(sig, expected)) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as SessionPayload;
    if (payload.sub !== "admin") return false;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp < now) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (await isAdminRequest(request)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
