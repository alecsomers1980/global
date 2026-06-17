import crypto from "node:crypto";
import type { StaffSession } from "@/lib/types";

function getSecret(): string {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET environment variable is required");
  }
  return process.env.AUTH_SECRET;
}

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

  const hmac = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
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
    .createHmac("sha256", getSecret())
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