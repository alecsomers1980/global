import { requireAdmin } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { logAudit } from '@/lib/audit';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateTempPassword(): string {
  const hasDigit = /\d/;
  const hasLetter = /[a-zA-Z]/;
  let p = '';
  do {
    p = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  } while (!hasDigit.test(p) || !hasLetter.test(p) || p.length < 8);
  return p;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminSupabase();
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (error) {
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }

    const staff = users.filter(
      (u) =>
        u.app_metadata?.short_code ||
        u.email?.endsWith('@aloesigns.co.za')
    ).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name ?? '',
      short_code: u.app_metadata?.short_code ?? '',
      role: u.app_metadata?.role ?? 'user',
    }));

    return NextResponse.json({ users: staff });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { email, full_name, short_code, role } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const allowedRoles = ['admin', 'user'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const tempPassword = generateTempPassword();
    const supabase = createAdminSupabase();

    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      app_metadata: {
        role: userRole,
        short_code: short_code ?? '',
        must_change_password: true,
      },
      user_metadata: { full_name: full_name ?? '' },
    });

    if (createError) {
      return NextResponse.json({ message: createError.message }, { status: 400 });
    }

    await logAudit({
      actorEmail: admin.staff.email,
      actorCode: admin.staff.code,
      action: 'user.create',
      entityType: 'user',
      entityId: email,
      summary: `Created ${email} (${short_code || '—'}, ${userRole})`,
    });

    return NextResponse.json({ tempPassword, email });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
