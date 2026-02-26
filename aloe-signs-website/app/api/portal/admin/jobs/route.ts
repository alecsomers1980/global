import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email?.endsWith('@aloesigns.co.za')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: jobs, error } = await adminSupabase
        .from('print_jobs')
        .select(`id, user_id, status, created_at, updated_at,
            material, delivery_type, delivery_address, ground_clearance, water_electricity_notes,
            safety_file_required, site_contact_person, site_contact_number, access_contact_person, access_contact_number,
            completion_target, setup_allowance, strike_allowance, storage_required, storage_time_estimate,
            profiles!print_jobs_user_id_fkey ( full_name, email, company, contact_number ),
            print_job_files ( id, original_name, display_name, description, storage_path ),
            proofs ( id, original_name, status, storage_path, created_at, proof_comments ( id, comment, is_admin, created_at, user_id ) )`)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ jobs });
}
