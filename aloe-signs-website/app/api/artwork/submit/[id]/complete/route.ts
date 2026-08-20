import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { getSubmission, markReceived, markNotified } from '@/lib/artwork/repository';
import { notifyTeamOfArtwork } from '@/lib/artwork/notify';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }

  if (submission.status === 'received') {
    return NextResponse.json({ ok: true, reference: submission.reference });
  }

  const supabase = createAdminSupabase();

  for (const file of submission.files) {
    const lastSlash = file.storage_path.lastIndexOf('/');
    const dir = file.storage_path.substring(0, lastSlash);
    const name = file.storage_path.substring(lastSlash + 1);

    const { data, error } = await supabase.storage.from('artwork-uploads').list(dir, { search: name });
    const found = data?.find(o => o.name === name);

    if (error || !found) {
      return NextResponse.json(
        { error: 'Some files did not finish uploading. Please try again.' },
        { status: 400 }
      );
    }
  }

  await markReceived(id);

  try {
    await notifyTeamOfArtwork({ ...submission, status: 'received' });
    await markNotified(id);
  } catch (e) {
    console.error('Artwork notification failed:', e);
    return NextResponse.json({ ok: true, notified: false, reference: submission.reference });
  }

  return NextResponse.json({ ok: true, notified: true, reference: submission.reference });
}

