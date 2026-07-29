import { supabase } from './supabase';
import { excerptFromHtml, spreadByCategory } from './text';

const SELECT = `
  id, title, slug, content, featured_image, published_at, author, view_count,
  post_categories ( categories ( name, slug ) )
`;

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string | null;
  author: string | null;
  view_count: number;
  categories: { name: string; slug: string }[];
};

type RawPost = {
  id: string; title: string; slug: string; content: string | null;
  featured_image: string | null; published_at: string | null;
  author: string | null; view_count: number | null;
  post_categories: { categories: { name: string; slug: string } | null }[] | null;
};

const HIDDEN_CATEGORIES = ['top-story', 'uncategorized'];

// Supabase's untyped `.select(string)` can't see that post_categories -> categories
// is many-to-one (via the category_id FK), so it infers the nested relation as an
// array regardless. At runtime it correctly returns a single object per row. This
// cast keeps RawPost matching real runtime shape rather than the client's
// conservative inferred type.
function toRawPosts(rows: unknown[] | null): RawPost[] {
  return (rows ?? []) as unknown as RawPost[];
}
function toRawPost(row: unknown | null): RawPost | null {
  return row as RawPost | null;
}

function toSummary(row: RawPost): PostSummary {
  const categories = (row.post_categories ?? [])
    .map(pc => pc.categories)
    .filter((c): c is { name: string; slug: string } => !!c)
    .filter(c => !HIDDEN_CATEGORIES.includes(c.slug));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: excerptFromHtml(row.content),
    featured_image: row.featured_image,
    published_at: row.published_at,
    author: row.author,
    view_count: row.view_count ?? 0,
    categories,
  };
}

function published(siteId: string) {
  return supabase.from('posts').select(SELECT).eq('site_id', siteId).eq('status', 'publish');
}

export async function getCategories(siteId: string) {
  const { data } = await supabase
    .from('categories').select('name, slug').eq('site_id', siteId).order('name');
  return (data ?? []).filter(c => !HIDDEN_CATEGORIES.includes(c.slug));
}

/** Hero band: 1 feature, 2 secondaries, 5 headlines. */
export async function getHeroPosts(siteId: string) {
  const { data } = await published(siteId)
    .order('is_top_story', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(8);

  const posts = toRawPosts(data).map(toSummary);
  return {
    feature: posts[0] ?? null,
    secondaries: posts.slice(1, 3),
    headlines: posts.slice(3, 8),
  };
}

export async function getTrendingPosts(siteId: string, excludeIds: string[]) {
  const { data } = await published(siteId)
    .order('published_at', { ascending: false })
    .limit(40);

  const posts = toRawPosts(data).map(toSummary).filter(p => !excludeIds.includes(p.id));
  return spreadByCategory(posts, 8, 2);
}

export async function getLatestPosts(
  siteId: string,
  { limit = 6, offset = 0, excludeIds = [] as string[] } = {}
) {
  const { data } = await published(siteId)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit + excludeIds.length - 1);

  return toRawPosts(data).map(toSummary).filter(p => !excludeIds.includes(p.id)).slice(0, limit);
}

/**
 * Popular ordering degrades gracefully: view_count leads, but every row starts
 * at 0, so is_top_story then recency decide until real traffic accumulates.
 */
export async function getPopularPosts(siteId: string, limit = 5) {
  const { data } = await published(siteId)
    .order('view_count', { ascending: false })
    .order('is_top_story', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  return toRawPosts(data).map(toSummary);
}

export async function getPostsByCategory(
  siteId: string,
  categorySlug: string,
  { limit = 12, offset = 0 } = {}
) {
  const { data: category } = await supabase
    .from('categories').select('id, name, slug')
    .eq('site_id', siteId).eq('slug', categorySlug).maybeSingle();

  if (!category) return { category: null, posts: [] as PostSummary[] };

  const { data: links } = await supabase
    .from('post_categories').select('post_id').eq('category_id', category.id);

  const ids = (links ?? []).map(l => l.post_id);
  if (!ids.length) return { category, posts: [] as PostSummary[] };

  const { data } = await published(siteId)
    .in('id', ids)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { category, posts: toRawPosts(data).map(toSummary) };
}

export async function getPostBySlug(siteId: string, slug: string) {
  const { data } = await published(siteId).eq('slug', slug).maybeSingle();
  const row = toRawPost(data);
  if (!row) return null;
  return { ...toSummary(row), content: row.content ?? '' };
}

export async function searchPosts(siteId: string, query: string, { limit = 20 } = {}) {
  if (!query.trim()) return [];
  const { data } = await published(siteId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);
  return toRawPosts(data).map(toSummary);
}

export async function getActiveAd(siteId: string) {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('advertisements')
    .select('client_name, banner_url, target_link')
    .eq('site_id', siteId).eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .limit(1).maybeSingle();
  return data ?? null;
}