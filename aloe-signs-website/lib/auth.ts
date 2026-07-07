import { createServerSupabase } from '@/lib/supabase-server';

export const ADMIN_EMAILS = ['andre@aloesigns.co.za'];

export async function getStaff() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email!;
  const role =
    user.app_metadata?.role === 'admin' || ADMIN_EMAILS.includes(email)
      ? 'admin'
      : 'user';
  const code = (user.app_metadata?.short_code as string) ?? null;
  const mustChange = !!user.app_metadata?.must_change_password;

  return { user, email, role, code, mustChange };
}

export async function requireAdmin() {
  const staff = await getStaff();
  if (!staff || staff.role !== 'admin') {
    return { ok: false, status: 403 } as const;
  }
  return { ok: true, staff } as const;
}
