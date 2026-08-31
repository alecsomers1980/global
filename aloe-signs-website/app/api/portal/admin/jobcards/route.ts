import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export async function GET() {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user /* || (!user.email?.endsWith('@aloesigns.co.za') && user.email !== 'view@aloesigns.co.za') */) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { rows } = await sql`SELECT * FROM jobcards ORDER BY created_at DESC`;
        return NextResponse.json({ jobcards: rows });
    } catch (error) {
        console.error("GET JOBCARDS API ERROR:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user /* || (!user.email?.endsWith('@aloesigns.co.za') && user.email !== 'view@aloesigns.co.za') */) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        // Resolve entry_number — auto-generate JC{YEAR}.{MM}.{NNN} unless one was supplied.
        let entryNumber: string;
        if (typeof body.entry_number === 'string' && body.entry_number.trim().length > 0) {
            entryNumber = body.entry_number;
        } else {
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const prefix = `JC${year}.${month}.`;

            const { rows: existing } = await sql`SELECT entry_number FROM jobcards WHERE entry_number LIKE ${prefix + '%'}`;

            let maxSeq = 0;
            for (const row of existing) {
                const afterDot = String(row.entry_number).substring(String(row.entry_number).lastIndexOf('.') + 1);
                const n = parseInt(afterDot, 10);
                if (!isNaN(n) && n > maxSeq) maxSeq = n;
            }

            entryNumber = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
        }

        // Default the date to today (editable later on the jobcard).
        const todayISO = new Date().toISOString().slice(0, 10);
        const jobDate = (typeof body.date === 'string' && body.date.trim().length > 0) ? body.date : todayISO;

        // A jobcard is "Captured" the moment it's created — set this server-side
        // (not just locally on the detail page's first view) so the list's status
        // and the SLA alert cron never disagree with what the detail page shows.
        const nowISO = new Date().toISOString();
        const initialWorkflow = JSON.stringify({ captured: { ticked: true, ticked_at: nowISO } });

        const { rows } = await sql`
            INSERT INTO jobcards (
                invoice, address, email, company, contact_name, contact_phone, entry_number, date, status, material, status_workflow_json
            ) VALUES (
                ${body.invoice || ''},
                ${body.address || ''},
                ${body.email || ''},
                ${body.company || ''},
                ${body.contact_name || ''},
                ${body.contact_phone || ''},
                ${entryNumber},
                ${jobDate},
                'Captured',
                '',
                ${initialWorkflow}
            ) RETURNING id
        `;

        await logAudit({
            actorEmail: user.email,
            actorCode: (user.app_metadata as any)?.short_code ?? null,
            action: 'jobcard.create',
            entityType: 'jobcard',
            entityId: rows[0].id,
            summary: `Created jobcard${body.company ? ` for ${body.company}` : ''}`,
        });

        return NextResponse.json({ id: rows[0].id });
    } catch (error) {
        console.error("POST JOBCARDS API ERROR:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
