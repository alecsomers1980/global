// Client helpers for the Projects admin: downscale large images in the browser
// (so uploads stay well under Vercel's ~4.5MB request limit) then push them to
// the project-media bucket via the auth-guarded admin route.

async function downscaleImage(file: File, maxDim = 2000, quality = 0.85): Promise<Blob> {
  // Skip tiny files and non-raster formats (e.g. SVG) — upload as-is.
  if (file.size < 1_000_000 || !/^image\/(jpe?g|png|webp)$/.test(file.type)) {
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      'image/jpeg',
      quality
    );
  });
}

// Large video (clips / full reel): get a signed URL from the server, then upload
// the file straight to Supabase Storage — bypasses Vercel's ~4.5MB request limit.
export async function uploadLargeMedia(
  file: File,
  folder: 'clips' | 'reels',
  projectKey: string
): Promise<string> {
  const { createClientSupabase } = await import('@/lib/supabase');

  const res = await fetch('/api/portal/admin/projects/clip-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, folder, projectKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not start upload');

  const supabase = createClientSupabase();
  const { error } = await supabase.storage
    .from('project-media')
    .uploadToSignedUrl(data.path, data.token, file);
  if (error) throw new Error(error.message || 'Upload failed');

  return data.publicUrl as string;
}

export async function uploadProjectMedia(file: File): Promise<string> {
  const isImage = file.type.startsWith('image/');
  const payload = isImage ? await downscaleImage(file) : file;
  const name = isImage ? file.name.replace(/\.[^.]+$/, '') + '.jpg' : file.name;

  const fd = new FormData();
  fd.append('file', payload, name);

  const res = await fetch('/api/portal/admin/projects/upload', {
    method: 'POST',
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}
