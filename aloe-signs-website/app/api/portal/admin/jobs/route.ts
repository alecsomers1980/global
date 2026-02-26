import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email?.endsWith('@aloesigns.co.za')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: jobData, error: jobsError } = await adminSupabase
        .from('print_jobs')
        .select(`id, user_id, status, created_at, updated_at,
            print_job_files ( id, original_name, display_name, description, storage_path ),
            proofs ( id, original_name, status, storage_path, created_at, proof_comments ( id, comment, is_admin, created_at, user_id ) )`)
        .order('created_at', { ascending: false });

    if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 });

    const userIds = Array.from(new Set(jobData?.map(j => j.user_id) || []));
    const { data: profileData } = await adminSupabase
        .from('profiles')
        .select('id, full_name, email, company, contact_number')
        .in('id', userIds);

    const profilesMap = new Map(profileData?.map(p => [p.id, p]) || []);

    const jobs = jobData?.map(job => ({
        ...job,
        profiles: profilesMap.get(job.user_id) || null
    }));

    return NextResponse.json({ jobs });
}

