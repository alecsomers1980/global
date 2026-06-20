export function applyUrl(ref: string): string {
  const base = process.env.PP_APPLY_BASE ?? "";
  return `${base}/vacancy/${encodeURIComponent(ref)}/apply`;
}