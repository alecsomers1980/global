import { randomBytes } from "node:crypto";

export const TOKEN_TTL_DAYS = 30;

export function makeToken(): string {
  return randomBytes(32).toString("base64url");
}

export function tokenExpiry(now: Date): Date {
  return new Date(now.getTime() + TOKEN_TTL_DAYS * 86_400_000);
}

export function isExpired(expires_at: string, now: Date): boolean {
  return new Date(expires_at).getTime() <= now.getTime();
}

