/**
 * Social links.
 *
 * Stored in site_settings so they change from the admin without a deploy. A
 * blank value means Rehoboth is not on that platform and nothing is rendered —
 * an icon linking nowhere is worse than no icon.
 */
export const PLATFORMS = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/27828249023" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/…" },
] as const;

export type Platform = (typeof PLATFORMS)[number]["key"];
export type SocialLinks = Record<Platform, string>;

export const EMPTY_SOCIAL: SocialLinks = {
  facebook: "",
  instagram: "",
  whatsapp: "",
  tiktok: "",
  youtube: "",
  linkedin: "",
};

/** Only http(s) links are kept. A stored "javascript:" would render as a link. */
export function cleanSocial(input: Partial<Record<string, unknown>>): SocialLinks {
  const out = { ...EMPTY_SOCIAL };
  for (const { key } of PLATFORMS) {
    const raw = String(input[key] ?? "").trim();
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (url.protocol === "http:" || url.protocol === "https:") out[key] = url.toString();
    } catch {
      // Not a URL at all; drop it rather than render a broken link.
    }
  }
  return out;
}

/** The platforms that actually have a link, in the order above. */
export function activeSocial(links: SocialLinks) {
  return PLATFORMS.filter((p) => links[p.key]).map((p) => ({ ...p, href: links[p.key] }));
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return EMPTY_SOCIAL;

  const { getServerClient } = await import("./supabase/server");
  const { data, error } = await getServerClient()
    .from("site_settings")
    .select("value")
    .eq("key", "social")
    .maybeSingle();

  if (error || !data) return EMPTY_SOCIAL;
  return cleanSocial(data.value as Record<string, unknown>);
}
