import { sql } from '@vercel/postgres';

export async function logAudit(e: {
  actorEmail?: string | null;
  actorCode?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  meta?: any;
}) {
  try {
    const meta = e.meta ? JSON.stringify(e.meta) : '{}';

    await sql`
      INSERT INTO audit_log (
        actor_email, actor_code, action, entity_type, entity_id, summary, meta
      ) VALUES (
        ${e.actorEmail ?? null},
        ${e.actorCode ?? null},
        ${e.action},
        ${e.entityType ?? null},
        ${e.entityId ?? null},
        ${e.summary ?? null},
        ${meta}::jsonb
      )
    `;
  } catch (error) {
    console.error('audit log insert failed', error);
    // never throw
  }
}
