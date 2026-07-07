import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

const STAFF_MEMBERS = [
  { email: 'andre@aloesigns.co.za', short_code: 'ADB', full_name: 'Andre De Bod', role: 'admin' },
  { email: 'melissa@aloesigns.co.za', short_code: 'MDB', full_name: 'Melissa De Bod', role: 'user' },
  { email: 'artwork@aloesigns.co.za', short_code: 'CK', full_name: 'Chanelle Kotze', role: 'user' },
  { email: 'marina@aloesigns.co.za', short_code: 'CMW', full_name: 'Marina De Bod', role: 'user' },
  { email: 'admin@aloesigns.co.za', short_code: 'AB', full_name: 'Anushka Bezuidenhout', role: 'user' },
];

function generateTempPassword(): string {
  // ensures at least one digit and one letter, length >= 12
  const hasDigit = /\d/;
  const hasLetter = /[a-zA-Z]/;
  let password = '';
  do {
    password = crypto
      .randomBytes(12)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12);
  } while (!hasDigit.test(password) || !hasLetter.test(password) || password.length < 8);

  return password;
}

export async function GET() {
  const adminSupabase = createAdminSupabase();

  // fetch all users (single page is enough for this project)
  const { data, error: listError } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listError) {
    return NextResponse.json({ error: `Failed to list users: ${listError.message}` }, { status: 500 });
  }
  const allUsers = data.users;

  // bootstrap guard: allow if NO user currently has a role set
  const hasAnyRole = allUsers.some((u) => u.app_metadata?.role);
  if (hasAnyRole) {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const created: { email: string; tempPassword: string }[] = [];
  const existing: string[] = [];
  const errors: { email: string; error: string }[] = [];

  for (const staff of STAFF_MEMBERS) {
    const existingUser = allUsers.find(
      (u) => u.email?.toLowerCase() === staff.email.toLowerCase()
    );

    if (existingUser) {
      try {
        await adminSupabase.auth.admin.updateUserById(existingUser.id, {
          app_metadata: {
            ...existingUser.app_metadata,
            role: staff.role,
            short_code: staff.short_code,
            must_change_password: existingUser.app_metadata?.must_change_password ?? true,
          },
        });
        existing.push(staff.email);
      } catch (err: any) {
        errors.push({ email: staff.email, error: err?.message ?? 'update failed' });
      }
    } else {
      try {
        const tempPassword = generateTempPassword();
        const { error: createError } = await adminSupabase.auth.admin.createUser({
          email: staff.email,
          password: tempPassword,
          email_confirm: true,
          app_metadata: {
            role: staff.role,
            short_code: staff.short_code,
            must_change_password: true,
          },
          user_metadata: {
            full_name: staff.full_name,
          },
        });

        if (createError) {
          errors.push({ email: staff.email, error: createError.message });
        } else {
          created.push({ email: staff.email, tempPassword });
        }
      } catch (err: any) {
        errors.push({ email: staff.email, error: err?.message ?? 'create failed' });
      }
    }
  }

  return NextResponse.json({ created, existing, errors });
}
