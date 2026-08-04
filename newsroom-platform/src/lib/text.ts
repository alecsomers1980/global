const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'",
  '&lt;': '<', '&gt;': '>', '&#8217;': '’', '&#8216;': '‘',
};

export function excerptFromHtml(html: string | null, maxChars = 160): string {
  if (!html) return '';

  let text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\n/g, ' ');

  for (const [entity, char] of Object.entries(ENTITIES)) {
    text = text.split(entity).join(char);
  }

  text = text.replace(/\s+/g, ' ').trim();

  if (text.length <= maxChars) return text;

  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

export function spreadByCategory<T extends { categories: { slug: string }[] }>(
  posts: T[],
  limit: number,
  maxPerCategory: number
): T[] {
  const picked: T[] = [];
  const overflow: T[] = [];
  const counts = new Map<string, number>();

  for (const post of posts) {
    const slug = post.categories[0]?.slug ?? '';
    const count = counts.get(slug) ?? 0;
    if (slug && count >= maxPerCategory) {
      overflow.push(post);
      continue;
    }
    counts.set(slug, count + 1);
    picked.push(post);
    if (picked.length === limit) return picked;
  }

  for (const post of overflow) {
    if (picked.length === limit) break;
    picked.push(post);
  }

  return picked.slice(0, limit);
}