import { createSessionServerClient } from '@/lib/supabase/session';

/**
 * Second auth layer for every /api/admin/* route, in addition to proxy.ts.
 * Caracal has exactly one admin operator -- any authenticated Supabase user
 * IS the admin. No roles table: that machinery belongs to a multi-staff site.
 */
export async function requireAdminSession(): Promise<{ userId: string } | null> {
  const supabase = await createSessionServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { userId: user.id } : null;
}
