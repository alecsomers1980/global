import type { User } from "@supabase/supabase-js";

/** Assurance level carried in the Supabase access token. aal2 = MFA satisfied. */
export type Aal = "aal1" | "aal2";

/**
 * Read the `aal` claim straight off the access token. Supabase puts it in the
 * JWT payload; decoding is enough because the token's authenticity is already
 * established by getUser() before we ever call this.
 */
export function aalFromAccessToken(accessToken: string | undefined): Aal {
  if (!accessToken) return "aal1";
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return "aal1";
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return json.aal === "aal2" ? "aal2" : "aal1";
  } catch {
    return "aal1";
  }
}

/** True once the user has a TOTP factor they've actually completed enrolment on. */
export function hasVerifiedFactor(user: User | null): boolean {
  return !!user?.factors?.some((f) => f.status === "verified");
}
