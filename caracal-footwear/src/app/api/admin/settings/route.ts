import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const KNOWN_KEYS = [
  'delivery_free_threshold',
  'delivery_fee',
  'lead_time',
  'contact_phone',
  'contact_email',
  'whatsapp_number',
] as const;

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Record<string, string>;

  const unknownKey = Object.keys(body).find((k) => !KNOWN_KEYS.includes(k as (typeof KNOWN_KEYS)[number]));
  if (unknownKey) {
    return NextResponse.json({ error: `Unknown setting key: ${unknownKey}` }, { status: 400 });
  }
  if ('delivery_free_threshold' in body || 'delivery_fee' in body) {
    for (const key of ['delivery_free_threshold', 'delivery_fee']) {
      if (key in body && (!Number.isInteger(Number(body[key])) || Number(body[key]) < 0)) {
        return NextResponse.json({ error: `${key} must be a non-negative integer number of cents.` }, { status: 400 });
      }
    }
  }

  const admin = createAdminClient();
  for (const [key, value] of Object.entries(body)) {
    const { error } = await admin.from('site_settings').update({ value: String(value) }).eq('key', key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
