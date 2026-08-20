import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { findExpired, deleteSubmissions, findUnnotified, markNotified } from '@/lib/artwork/repository';
import { notifyTeamOfArtwork } from '@/lib/artwork/notify';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabase();

  const expired = await findExpired();

  const paths = expired.flatMap((e) => e.storage_paths).filter(Boolean);

  if (paths.length > 0) {
    const { error } = await supabase.storage.from('artwork-uploads').remove(paths);
    if (error) {
      console.error('Artwork purge: storage delete failed:', error);
    }
  }

  await deleteSubmissions(expired.map((e) => e.id));

  let retried = 0;
  for (const s of await findUnnotified()) {
    try {
      await notifyTeamOfArtwork(s);
      await markNotified(s.id);
      retried++;
    } catch (e) {
      console.error(`Artwork notify retry failed for ${s.reference}:`, e);
    }
  }

  return NextResponse.json({ ok: true, purged: expired.length, retried });
}

