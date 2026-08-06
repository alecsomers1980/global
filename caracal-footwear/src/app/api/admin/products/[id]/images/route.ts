import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB — sane upper bound on a phone photo

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: productId } = await params;
  const admin = createAdminClient();

  const { data: product, error: productErr } = await admin
    .from('products')
    .select('id, name')
    .eq('id', productId)
    .single();
  if (productErr || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  const colour = form.get('colour');
  const colourName = typeof colour === 'string' && colour !== '' ? colour : null;

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const { data: existing } = await admin
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1);
  let nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const inserted: { id: string; url: string }[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${file.name} is larger than 10MB` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Never trust the client's own optimization -- resize and re-encode
    // server-side. 1200x900 matches the card/gallery aspect ratio the
    // frontend already builds around (see scripts/prepare-images.mjs).
    const optimized = await sharp(buffer)
      .resize(1200, 900, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer();

    const path = `${productId}/${crypto.randomUUID()}.webp`;
    const { error: uploadErr } = await admin.storage
      .from('product-images')
      .upload(path, optimized, { contentType: 'image/webp' });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: publicUrl } = admin.storage.from('product-images').getPublicUrl(path);

    const { data: row, error: insertErr } = await admin
      .from('product_images')
      .insert({
        product_id: productId,
        colour_name: colourName,
        url: publicUrl.publicUrl,
        alt: `${product.name}${colourName ? `, ${colourName}` : ''}`,
        sort_order: nextSortOrder++,
      })
      .select('id, url')
      .single();
    if (insertErr || !row) {
      return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 });
    }
    inserted.push(row);
  }

  return NextResponse.json({ success: true, images: inserted });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: productId } = await params;
  const admin = createAdminClient();
  const body = await req.json();

  let targetRows: { id: string; url: string }[] = [];

  if (typeof body.imageId === 'string') {
    const { data } = await admin
      .from('product_images')
      .select('id, url')
      .eq('id', body.imageId)
      .eq('product_id', productId);
    targetRows = data ?? [];
  } else if (typeof body.colour === 'string') {
    // Bulk delete: every image assigned to this colour on this product.
    const { data } = await admin
      .from('product_images')
      .select('id, url')
      .eq('product_id', productId)
      .eq('colour_name', body.colour);
    targetRows = data ?? [];
  } else {
    return NextResponse.json({ error: 'imageId or colour is required' }, { status: 400 });
  }

  if (targetRows.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 });
  }

  const paths = targetRows.map((r) => {
    const marker = '/product-images/';
    const idx = r.url.indexOf(marker);
    return idx === -1 ? r.url : r.url.slice(idx + marker.length);
  });
  await admin.storage.from('product-images').remove(paths);

  const { error: deleteErr } = await admin
    .from('product_images')
    .delete()
    .in('id', targetRows.map((r) => r.id));
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: targetRows.length });
}
