import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const BUCKET = 'news-images';

export async function POST(req: Request) {
  try {
    // Auth guard
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    // Validate file presence and type
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Size limit
    const MAX = 8 * 1024 * 1024;
    if (file.size > MAX) {
      return NextResponse.json({ error: 'Image must be under 8MB' }, { status: 400 });
    }

    const admin = createAdminSupabase();

    // Ensure the bucket exists (idempotent)
    const { data: existing } = await admin.storage.getBucket(BUCKET);
    if (!existing) {
      await admin.storage.createBucket(BUCKET, { public: true });
    }

    // Build safe unique file path
    const ext = (file.name.split('.').pop() || 'jpg')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload using service-role client
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  } catch (error: any) {
    console.error('[news.upload]', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}