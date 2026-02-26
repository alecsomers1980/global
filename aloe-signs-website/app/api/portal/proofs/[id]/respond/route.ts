import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { notifyAdminProofResponse } from '@/lib/portal-email';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: proofId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, comment } = await req.json() as { action: 'Approved' | 'Edit Required'; comment?: string };
    if (!['Approved', 'Edit Required'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const { error: updateError } = await supabase.from('proofs').update({ status: action }).eq('id', proofId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    if (comment?.trim()) {
        await supabase.from('proof_comments').insert({ proof_id: proofId, user_id: user.id, comment: comment.trim(), is_admin: false });
    }

    const { data: proof } = await supabase.from('proofs').select('original_name').eq('id', proofId).single();
    try {
        await notifyAdminProofResponse({ clientName: user.user_metadata?.full_name || user.email || 'Unknown', clientEmail: user.email || '', proofName: proof?.original_name || 'Proof', action, comment: comment?.trim() });
    } catch (e) { console.error('Email failed:', e); }

    return NextResponse.json({ ok: true });
}
