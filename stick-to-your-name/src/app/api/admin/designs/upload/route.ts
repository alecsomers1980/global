import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'Only image files allowed.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Image must be under 5MB.' }, { status: 400 });
    }

    const safeName = 'designs/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = await put(safeName, file, { access: 'public' });

    return Response.json({ url: blob.url });
  } catch {
    return Response.json({ error: 'Upload failed.' }, { status: 500 });
  }
}