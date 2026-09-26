/**
 * Who counts as an admin.
 *
 * `ADMIN_EMAIL` holds one address or a comma-separated list, so a second admin login
 * can be added without a code change. The gate fails closed: an unset or empty
 * variable admits nobody, rather than admitting everybody.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminEmails();
  return allowed.length > 0 && allowed.includes(email.trim().toLowerCase());
}

/**
 * Set by the sign-in page when "keep me signed in" is unticked. The middleware
 * refreshes auth cookies on every request with its own lifetime, so the choice has
 * to travel with the request or it is overwritten on the very next page load.
 */
export const SHORT_SESSION_COOKIE = "ember-short-session";
export const SHORT_SESSION_SECONDS = 60 * 60 * 8;
