import { getStaff } from '@/lib/auth';

/**
 * Artwork submissions carry third parties' personal information, so access is
 * limited to Aloe Signs staff.
 *
 * requireAdmin() is too narrow — it is Andre only. getStaff() alone is too broad —
 * it returns non-null for any authenticated user, including registered *clients*,
 * who must never see other people's submissions.
 */
export async function requireStaff(): Promise<boolean> {
  const staff = await getStaff();
  if (!staff) return false;

  // Admins are staff regardless of address — the site administrator is on an
  // external domain, so a domain-only check locks them out of their own portal.
  if (staff.role === 'admin') return true;

  return staff.email.toLowerCase().endsWith('@aloesigns.co.za');
}
