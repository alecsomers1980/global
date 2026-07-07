import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT now(),
        actor_email TEXT,
        actor_code TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        summary TEXT,
        meta JSONB DEFAULT '{}'::jsonb
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS audit_log_created_idx
      ON audit_log (created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS audit_log_entity_idx
      ON audit_log (entity_type)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'setup failed' }, { status: 500 });
  }
}
