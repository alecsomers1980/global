import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { notifyAdminNewJob } from '@/lib/portal-email';

export async function GET() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: jobs, error } = await supabase.from('print_jobs')
        .select(`id, status, created_at, updated_at,
            print_job_files ( id, original_name, description, width, height, unit, quantity, storage_path ),
            proofs ( id, original_name, status, storage_path, created_at, proof_comments ( id, comment, is_admin, created_at, user_id ) )`)
        .eq('user_id', user.id).order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { files } = await req.json() as { files: Array<{ storagePath: string; originalName: string; description: string; width: number; height: number; unit: string; quantity: number }> };
    if (!files || files.length === 0) return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });

    const { data: job, error: jobError } = await supabase.from('print_jobs').insert({ user_id: user.id, status: 'Uploaded' }).select('id').single();
    if (jobError || !job) return NextResponse.json({ error: jobError?.message || 'Failed to create job' }, { status: 500 });

    const fileRecords = files.map(f => ({ job_id: job.id, storage_path: f.storagePath, original_name: f.originalName, description: f.description, width: f.width, height: f.height, unit: f.unit, quantity: f.quantity }));
    const { error: filesError } = await supabase.from('print_job_files').insert(fileRecords);
    if (filesError) return NextResponse.json({ error: filesError.message }, { status: 500 });

    try { await notifyAdminNewJob({ clientName: user.user_metadata?.full_name || user.email || 'Unknown', clientEmail: user.email || '', fileCount: files.length }); } catch (e) { console.error('Failed to notify admin:', e); }

    return NextResponse.json({ jobId: job.id });
}
