export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  heroImage: string | null;
  publishedAt: string | null;
};

/**
 * The text inside a post, with the markup taken out.
 *
 * Used for the compliance screen and for a fallback excerpt. A claim is a
 * claim whether or not it happens to be inside a <strong>, so the screen has
 * to see the words rather than the HTML.
 */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function fromRow(row: Record<string, unknown>): NewsPost {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt as string) ?? null,
    body: (row.body as string) ?? "",
    heroImage: (row.hero_image as string) ?? null,
    publishedAt: (row.published_at as string) ?? null,
  };
}

/**
 * Published posts, newest first.
 *
 * Returns nothing rather than throwing when Supabase is not configured, so a
 * fresh clone still renders — the news is an addition to the shop, and an
 * empty section is a far better failure than a home page that will not build.
 */
export async function getNews(limit?: number): Promise<NewsPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  const { getServerClient } = await import("./supabase/server");
  let q = getServerClient()
    .from("news_posts")
    .select("id, slug, title, excerpt, body, hero_image, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw new Error(`getNews: ${error.message}`);
  return (data ?? []).map(fromRow);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const { getServerClient } = await import("./supabase/server");
  const { data, error } = await getServerClient()
    .from("news_posts")
    .select("id, slug, title, excerpt, body, hero_image, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(`getNewsBySlug: ${error.message}`);
  return data ? fromRow(data) : null;
}

/** "12 August 2026" — the form a South African reader expects. */
export function newsDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
