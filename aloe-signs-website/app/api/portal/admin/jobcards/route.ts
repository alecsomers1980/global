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
        
        // Setup empty default values
        const { rows } = await sql`
            INSERT INTO jobcards (
                invoice, address, email, company, contact_name, contact_phone, entry_number, date, status, material
            ) VALUES (
                ${body.invoice || ''},
                ${body.address || ''},
                ${body.email || ''},
                ${body.company || ''},
                ${body.contact_name || ''},
                ${body.contact_phone || ''},
                ${body.entry_number || ''},
                ${body.date || ''},
                'Quoted',
                ''
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
