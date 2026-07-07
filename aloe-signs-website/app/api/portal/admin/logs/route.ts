import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: 'Forbidden' }, { status: admin.status });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10) || 200, 500);

    let queryText = '';
    const params: any[] = [limit];

    switch (tab) {
      case 'jobcards':
        queryText = `
          SELECT id, created_at, actor_email, actor_code, action, entity_type, entity_id, summary
          FROM audit_log
          WHERE entity_type = 'jobcard'
          ORDER BY created_at DESC
          LIMIT $1
        `;
        break;

      case 'site':
        queryText = `
          SELECT id, created_at, actor_email, actor_code, action, entity_type, entity_id, summary
          FROM audit_log
          WHERE entity_type IN ('settings', 'product', 'user')
          ORDER BY created_at DESC
          LIMIT $1
        `;
        break;

      case 'sales':
        queryText = `
          SELECT * FROM (
            SELECT created_at AS "when", customer_email AS who, order_number AS ref, total AS amount, 'shop' AS source, payment_status AS status
            FROM orders
            UNION ALL
            SELECT updated_at AS "when", compiled_by AS who,
                   COALESCE(final_invoice, invoice, entry_number, company) AS ref,
                   total AS amount, 'jobcard' AS source, status
            FROM jobcards
            WHERE final_invoice IS NOT NULL OR (total IS NOT NULL AND status = 'Completed')
          ) s
          ORDER BY "when" DESC NULLS LAST
          LIMIT $1
        `;
        break;

      default: // 'all'
        queryText = `
          SELECT id, created_at, actor_email, actor_code, action, entity_type, entity_id, summary
          FROM audit_log
          ORDER BY created_at DESC
          LIMIT $1
        `;
        break;
    }

    const { rows } = await sql.query(queryText, params);
    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
