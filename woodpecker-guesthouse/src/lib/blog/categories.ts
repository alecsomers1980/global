// Woodpecker Guesthouse blog categories — Hazyview / Panorama Route / Kruger
// guesthouse angle. Kept separate from Aloe Signs' news-categories.ts because
// the topic list, not just the client name, is different.

export const BLOG_CATEGORIES = [
  "Kruger Safaris & Wildlife",
  "Panorama Route & Local Attractions",
  "Family Travel & Kids",
  "Conferencing & Groups",
  "Restaurant & Local Flavours",
  "Hazyview & Mpumalanga Travel Tips",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Returns the least-recently-used category, breaking ties at random.
 *  Unknown strings in recentCategories (e.g. a category later renamed or
 *  removed) are ignored rather than throwing. */
export function pickNextCategory(recentCategories: string[]): BlogCategory {
  const counts = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c, 0])) as Record<BlogCategory, number>;
  for (const rc of recentCategories) {
    if ((BLOG_CATEGORIES as readonly string[]).includes(rc)) {
      counts[rc as BlogCategory]++;
    }
  }
  const min = Math.min(...BLOG_CATEGORIES.map((c) => counts[c]));
  const least = BLOG_CATEGORIES.filter((c) => counts[c] === min);
  return least[Math.floor(Math.random() * least.length)];
}