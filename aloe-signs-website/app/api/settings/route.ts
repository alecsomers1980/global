import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { rows } = await sql`SELECT value FROM settings WHERE key = 'pricing'`;
    const pricing = rows[0]?.value ?? {};

    return NextResponse.json({ pricing });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return NextResponse.json({ error: 'Forbidden' }, { status: admin.status });

    const body = await req.json();

    await sql.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ('pricing', $1::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [JSON.stringify(body)]
    );

    await logAudit({
      actorEmail: admin.staff.email,
      actorCode: admin.staff.code,
      action: 'settings.update',
      entityType: 'settings',
      entityId: 'pricing',
      summary: 'Updated pricing settings',
    });

    return NextResponse.json({ success: true, pricing: body });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}