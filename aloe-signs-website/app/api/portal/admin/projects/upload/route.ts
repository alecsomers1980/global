import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'project-media';

export async function POST(req: Request) {
  try {
    // Auth guard
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'File must be an image or video' }, { status: 400 });
    }

    // Note: Vercel serverless request bodies are limited to ~4.5MB. Large reels
    // should be produced offline and referenced by URL instead of uploaded here.
    const MAX = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > MAX) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Video is too large to upload here — paste the reel URL instead.'
            : 'Image must be under 8MB.',
        },
        { status: 400 }
      );
    }

    const admin = createAdminSupabase();

    // Ensure the public bucket exists (idempotent)
    const { data: existing } = await admin.storage.getBucket(BUCKET);
    if (!existing) {
      await admin.storage.createBucket(BUCKET, { public: true });
    }

    const ext = (file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || (isVideo ? 'mp4' : 'jpg');
    const folder = isVideo ? 'reels' : 'images';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  } catch (error: any) {
    console.error('[project.upload]', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
