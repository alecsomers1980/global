import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { notifyAdminNewJob, notifyAdminArtworkUpload } from '@/lib/portal-email';

export async function GET() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: jobs, error } = await supabase.from('print_jobs')
        .select(`id, status, created_at, updated_at,
            material, delivery_type, delivery_address, ground_clearance, water_electricity_notes,
            safety_file_required, site_contact_person, site_contact_number, access_contact_person, access_contact_number,
            completion_target, setup_allowance, strike_allowance, storage_required, storage_time_estimate,
            print_job_files ( id, original_name, display_name, description, storage_path ),
            proofs ( id, original_name, status, storage_path, created_at, proof_comments ( id, comment, is_admin, created_at, user_id ) )`)
        .eq('user_id', user.id).order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
        files, material, deliveryType, deliveryAddress, groundClearance,
        waterElectricityNotes, safetyFileRequired, siteContactPerson, siteContactNumber,
        accessContactPerson, accessContactNumber, completionTarget,
        setupAllowance, strikeAllowance, storageRequired, storageTimeEstimate
    } = body;

    if (!files || files.length === 0) return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });

    const { data: job, error: jobError } = await supabase.from('print_jobs').insert({
        user_id: user.id,
        status: 'Uploaded',
        material,
        delivery_type: deliveryType,
        delivery_address: deliveryAddress,
        ground_clearance: groundClearance,
        water_electricity_notes: waterElectricityNotes,
        safety_file_required: safetyFileRequired,
        site_contact_person: siteContactPerson,
        site_contact_number: siteContactNumber,
        access_contact_person: accessContactPerson,
        access_contact_number: accessContactNumber,
        completion_target: completionTarget || null,
        setup_allowance: setupAllowance,
        strike_allowance: strikeAllowance,
        storage_required: storageRequired,
        storage_time_estimate: storageTimeEstimate
    }).select('id').single();

    if (jobError || !job) return NextResponse.json({ error: jobError?.message || 'Failed to create job' }, { status: 500 });

    const fileRecords = files.map((f: any) => ({
        job_id: job.id,
        storage_path: f.storagePath,
        original_name: f.originalName,
        display_name: f.displayName || null,
        description: f.description
    }));
    const { error: filesError } = await supabase.from('print_job_files').insert(fileRecords);
    if (filesError) return NextResponse.json({ error: filesError.message }, { status: 500 });

    // Fetch client profile for company & contact info
    const { data: profile } = await supabase.from('profiles').select('company, contact_number').eq('id', user.id).single();

    // Check if this is a simplified artwork upload (missing job spec fields)
    const isSimplifiedUpload = !material && !deliveryType && !deliveryAddress && !setupAllowance && !strikeAllowance;

    try {
        if (isSimplifiedUpload) {
            await notifyAdminArtworkUpload({
                clientName: user.user_metadata?.full_name || user.email || 'Unknown',
                clientEmail: user.email || '',
                contactNumber: profile?.contact_number || undefined,
                files: files.map((f: any) => ({
                    displayName: f.displayName,
                    description: f.description
                })),
            });
        } else {
            await notifyAdminNewJob({
                clientName: user.user_metadata?.full_name || user.email || 'Unknown',
                clientEmail: user.email || '',
                company: profile?.company || undefined,
                contactNumber: profile?.contact_number || undefined,
                material,
                deliveryType,
                deliveryAddress,
                groundClearance,
                waterElectricityNotes,
                safetyFileRequired,
                siteContactPerson,
                siteContactNumber,
                accessContactPerson,
                accessContactNumber,
                completionTarget,
                setupAllowance,
                strikeAllowance,
                storageRequired,
                storageTimeEstimate,
                files: files.map((f: any) => ({
                    displayName: f.displayName,
                    originalName: f.originalName,
                    description: f.description
                })),
            });
        }
    } catch (e) { console.error('Failed to notify admin:', e); }

    return NextResponse.json({ jobId: job.id });
}
