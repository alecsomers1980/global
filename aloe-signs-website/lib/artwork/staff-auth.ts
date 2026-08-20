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
  return staff.email.toLowerCase().endsWith('@aloesigns.co.za');
}
