// Shared helper for uploading a file to Supabase Storage via the admin API.
// Used by the Accommodation, Gallery, and Red Litchi admin managers.
export async function uploadFile(file, folder) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || "Upload failed");
  }

  const { url } = await res.json();
  return url;
}

// Uploads multiple files one after another, returning the URLs that succeeded.
// A failed file doesn't stop the rest; failures are returned alongside so the
// caller can report them without losing the files that did upload.
export async function uploadFiles(files, folder) {
  const urls = [];
  const errors = [];
  for (const file of files) {
    try {
      urls.push(await uploadFile(file, folder));
    } catch (err) {
      errors.push(`${file.name}: ${err.message}`);
    }
  }
  return { urls, errors };
}
