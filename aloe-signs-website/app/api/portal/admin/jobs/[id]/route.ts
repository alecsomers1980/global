import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { notifyClientProofReady } from '@/lib/portal-email';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: jobId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email?.endsWith('@aloesigns.co.za')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const body = await req.json();

    if (body.status) {
        const valid = ['Uploaded', 'Processing', 'Awaiting Proof Signoff', 'Completed'];
        if (!valid.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        const { error } = await adminSupabase.from('print_jobs').update({ status: body.status }).eq('id', jobId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (body.notifyClient) {
            const { data: job } = await adminSupabase.from('print_jobs').select('user_id, profiles!print_jobs_user_id_fkey ( full_name, email )').eq('id', jobId).single();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const profile = (job as any)?.profiles;
            if (profile?.email) {
                try {
                    const { sendPortalEmail } = await import('@/lib/portal-email');
                    await sendPortalEmail({
                        to: profile.email, subject: `Job Status Updated - ${body.status}`, title: 'Job Status Update',
                        body: `<h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:#2d2d2d;">Status Updated</h1><p style="color:#6b7280;">Hi ${profile.full_name || 'there'}, your job status is now:</p><div style="background:#f0fce4;border-left:4px solid #84cc16;border-radius:6px;padding:18px 20px;margin:20px 0;"><p style="margin:0;font-size:18px;font-weight:700;color:#2d2d2d;">${body.status}</p></div><div style="text-align:center;margin-top:28px;"><a href="https://aloe-signs-website.vercel.app/portal/" style="display:inline-block;background:#84cc16;color:#2d2d2d;font-weight:700;padding:14px 32px;text-decoration:none;border-radius:8px;">View Dashboard</a></div>`,
                        text: `Hi ${profile.full_name || 'there'}, your job status is now: ${body.status}.`
                    });
                } catch (e) { console.error('Email failed:', e); }
            }
        }
        return NextResponse.json({ ok: true });
    }

    if (body.proofStoragePath && body.proofOriginalName) {
        const { data: proof, error } = await adminSupabase.from('proofs').insert({ job_id: jobId, storage_path: body.proofStoragePath, original_name: body.proofOriginalName, status: 'Pending' }).select('id').single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await adminSupabase.from('print_jobs').update({ status: 'Awaiting Proof Signoff' }).eq('id', jobId);
        const { data: job } = await adminSupabase.from('print_jobs').select('user_id, profiles!print_jobs_user_id_fkey ( full_name, email )').eq('id', jobId).single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = (job as any)?.profiles;
        if (profile?.email) { try { await notifyClientProofReady({ clientEmail: profile.email, clientName: profile.full_name || 'Client', proofName: body.proofOriginalName }); } catch (e) { console.error('Email failed:', e); } }
        return NextResponse.json({ proofId: proof.id });
    }

    return NextResponse.json({ error: 'No valid action' }, { status: 400 });
}
