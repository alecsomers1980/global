// Client helper: uploads an image file to the news-images bucket via the
// auth-guarded admin route and returns its public URL.
export async function uploadNewsImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/portal/admin/news/upload', {
    method: 'POST',
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}
