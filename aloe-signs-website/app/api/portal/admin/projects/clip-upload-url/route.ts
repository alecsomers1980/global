import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'project-media';

// Issues a short-lived signed upload URL so the browser can push large video
// files straight to Supabase Storage, bypassing Vercel's ~4.5MB request limit.
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({} as any));
    const filename: string = body.filename || 'clip.mp4';
    const folder = body.folder === 'reels' ? 'reels' : 'clips';
    const projectKey = String(body.projectKey || 'unassigned').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'unassigned';

    const ext = (filename.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
    const path = `${folder}/${projectKey}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const admin = createAdminSupabase();

    // Ensure the public bucket exists (idempotent)
    const { data: existing } = await admin.storage.getBucket(BUCKET);
    if (!existing) {
      await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: '50MB' });
    }

    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      path: data.path,
      token: data.token,
      publicUrl: pub.publicUrl,
    });
  } catch (error: any) {
    console.error('[project.clip-upload-url]', error);
    return NextResponse.json({ error: error?.message || 'Failed to create upload URL' }, { status: 500 });
  }
}
