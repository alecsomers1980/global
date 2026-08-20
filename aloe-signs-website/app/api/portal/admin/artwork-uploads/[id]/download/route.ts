import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/artwork/staff-auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { getSubmission, markDownloaded } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const fileId = req.nextUrl.searchParams.get('file');

  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const file = submission.files.find((f) => f.id === fileId);
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase.storage
    .from('artwork-uploads')
    .createSignedUrl(file.storage_path, 3600, { download: file.original_name });

  if (error || !data) {
    return NextResponse.json(
      { error: 'Could not prepare the download.' },
      { status: 500 }
    );
  }

  await markDownloaded(id);

  return NextResponse.redirect(data.signedUrl);
}

