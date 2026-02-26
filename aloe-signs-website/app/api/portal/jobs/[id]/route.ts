import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: job, error } = await supabase.from('print_jobs')
        .select(`id, status, created_at, updated_at, user_id,
            print_job_files ( id, original_name, description, width, height, unit, quantity, storage_path, created_at ),
            proofs ( id, original_name, status, storage_path, created_at, proof_comments ( id, comment, is_admin, created_at, user_id ) )`)
        .eq('id', id).single();

    if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (job.user_id !== user.id && !user.email?.endsWith('@aloesigns.co.za')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ job });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    if (body.fileId && body.updates) {
        const { error } = await supabase.from('print_job_files').update(body.updates).eq('id', body.fileId).eq('job_id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }
    if (body.newFiles && Array.isArray(body.newFiles)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records = body.newFiles.map((f: any) => ({ job_id: id, storage_path: f.storagePath, original_name: f.originalName, description: f.description, width: f.width, height: f.height, unit: f.unit, quantity: f.quantity }));
        const { error } = await supabase.from('print_job_files').insert(records);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'No valid action' }, { status: 400 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const fileId = new URL(req.url).searchParams.get('fileId');
    if (!fileId) return NextResponse.json({ error: 'fileId required' }, { status: 400 });

    const { data: file } = await supabase.from('print_job_files').select('storage_path').eq('id', fileId).eq('job_id', id).single();
    if (file) await supabase.storage.from('client-uploads').remove([file.storage_path]);
    const { error } = await supabase.from('print_job_files').delete().eq('id', fileId).eq('job_id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
