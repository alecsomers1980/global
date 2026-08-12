import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createServerSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

let _logoDataUrl: string | null = null;
function getLogoDataUrl() {
    if (_logoDataUrl) return _logoDataUrl;
    const logoPath = join(process.cwd(), 'public', 'aloe-logo.png');
    const buf = readFileSync(logoPath);
    _logoDataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    return _logoDataUrl;
}

// GET /api/portal/admin/jobcards/[id]/pdf — branded, pricing-free jobcard PDF
// for the shop floor: header info + item list + ticked department specs.
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        const { rows } = await sql`SELECT * FROM jobcards WHERE id = ${id}`;
        if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const jobcard = rows[0];

        const { default: React } = await import('react');
        const { renderToBuffer } = await import('@react-pdf/renderer');
        const { default: JobcardPdf } = await import('@/lib/jobcard-pdf');

        const doc = React.createElement(JobcardPdf, { jobcard, logo: getLogoDataUrl() });
        const buffer = await renderToBuffer(doc as any);
        const filename = `Jobcard-${jobcard.entry_number || id}.pdf`;

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('[api/portal/admin/jobcards/[id]/pdf] PDF render failed:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
