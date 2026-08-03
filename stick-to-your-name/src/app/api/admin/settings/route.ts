export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSettings, updateSettings } from '@/lib/db';

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Error in GET /api/admin/settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const allowedKeys = [
      'set_price_cents',
      'bagtag_price_cents',
      'collect_price_cents',
      'pudo_price_cents',
      'courier_price_cents',
    ];

    const patch: Record<string, number> = {};
    for (const key of allowedKeys) {
      if (key in body) {
        const value = body[key];
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
          return NextResponse.json(
            { error: 'Prices must be non-negative whole numbers (cents).' },
            { status: 400 }
          );
        }
        patch[key] = value;
      }
    }

    await updateSettings(patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /api/admin/settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}