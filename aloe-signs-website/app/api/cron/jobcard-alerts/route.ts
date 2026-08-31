import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSlaBreach } from '@/lib/jobcard-sla';
import { notifyAdminJobcardSlaBreach } from '@/lib/portal-email';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nowMs = Date.now();
  const { rows } = await sql`
    SELECT id, entry_number, company, contact_name, status_workflow_json,
           sla_captured_alert_sent_at, sla_quote_approved_alert_sent_at
    FROM jobcards
    WHERE status != 'Completed'
  `;

  let alerted = 0;
  for (const jc of rows) {
    const breach = getSlaBreach(jc, nowMs);
    if (!breach) continue;

    const alreadySent = breach.kind === 'captured_stall'
      ? jc.sla_captured_alert_sent_at
      : jc.sla_quote_approved_alert_sent_at;
    if (alreadySent) continue;

    const column = breach.kind === 'captured_stall'
      ? 'sla_captured_alert_sent_at'
      : 'sla_quote_approved_alert_sent_at';

    try {
      await notifyAdminJobcardSlaBreach({
        jobcardId: jc.id,
        entryNumber: jc.entry_number || jc.id,
        clientName: jc.company || jc.contact_name || 'Unknown client',
        reason: breach.reason,
      });
      await sql.query(`UPDATE jobcards SET ${column} = NOW() WHERE id = $1`, [jc.id]);
      alerted++;
    } catch (e) {
      console.error(`SLA alert failed for jobcard ${jc.id}:`, e);
    }
  }

  return NextResponse.json({ ok: true, checked: rows.length, alerted });
}
