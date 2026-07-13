export const NEWS_CATEGORIES = [
  "Vehicle & Fleet Branding",
  "Billboards & Large Format",
  "Safety & Regulatory Signs",
  "Retail & Storefront Signage",
  "Events, Activations & Exhibitions",
  "Signage Buying Guides",
  "Branding & Design Tips",
  "Local Projects — Johannesburg & Gauteng",
  "Sustainability & Materials",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const FALLBACK_IMAGES: Record<NewsCategory, string[]> = {
  "Vehicle & Fleet Branding": [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=630&fit=crop&q=80",
  ],
  "Billboards & Large Format": [
    "https://images.unsplash.com/photo-1501526029524-a8ea925b2e8b?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500239770255-41c5b25a65c8?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582584115864-76b6e7a282a5?w=1200&h=630&fit=crop&q=80",
  ],
  "Safety & Regulatory Signs": [
    "https://images.unsplash.com/photo-1614313913007-2b1e6c9a0c11?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&h=630&fit=crop&q=80",
  ],
  "Retail & Storefront Signage": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563906267088-b029e7101114?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=630&fit=crop&q=80",
  ],
  "Events, Activations & Exhibitions": [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551966775-a8835f0c2c29?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=630&fit=crop&q=80",
  ],
  "Signage Buying Guides": [
    "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504257475151-2010c9f998ba?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=1200&h=630&fit=crop&q=80",
  ],
  "Branding & Design Tips": [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop&q=80",
  ],
  "Local Projects — Johannesburg & Gauteng": [
    "https://images.unsplash.com/photo-1577455432549-47128679ad7b?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600355683312-8b472865da07?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596662950260-3acec0d73b1c?w=1200&h=630&fit=crop&q=80",
  ],
  "Sustainability & Materials": [
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092580506-b6a8d4b486c5?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200&h=630&fit=crop&q=80",
  ],
};

export const CATEGORY_UNSPLASH_TERMS: Record<NewsCategory, string[]> = {
  "Vehicle & Fleet Branding": ["vehicle wrap", "fleet branding", "car decal", "van graphics"],
  "Billboards & Large Format": ["billboard advertising", "large format printing", "outdoor signage", "billboard design"],
  "Safety & Regulatory Signs": ["safety signage industrial", "OHS signs", "warning signs factory", "regulatory sign board"],
  "Retail & Storefront Signage": ["shopfront signage", "storefront sign", "retail display", "window graphics"],
  "Events, Activations & Exhibitions": ["event branding exhibition", "trade show booth", "activation branding", "pop up banner"],
  "Signage Buying Guides": ["printing large format", "signage material", "outdoor print", "vinyl banner"],
  "Branding & Design Tips": ["brand design signage", "graphic design printing", "commercial signage design", "brand identity print"],
  "Local Projects — Johannesburg & Gauteng": ["johannesburg city", "gauteng skyline", "south african business", "joburg street"],
  "Sustainability & Materials": ["recycled materials", "eco friendly signage", "sustainable printing", "green manufacturing"],
};

export function pickNextCategory(recentCategories: NewsCategory[]): NewsCategory {
  const counts = Object.fromEntries(NEWS_CATEGORIES.map(c => [c, 0])) as Record<NewsCategory, number>;
  for (const rc of recentCategories) {
    if (rc in counts) counts[rc]++;
  }
  const min = Math.min(...NEWS_CATEGORIES.map(c => counts[c]));
  const least = NEWS_CATEGORIES.filter(c => counts[c] === min);
  return least[Math.floor(Math.random() * least.length)];
}