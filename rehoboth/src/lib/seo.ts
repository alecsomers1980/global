import type { NewsPost } from "./news";
import type { Product } from "./catalog";
import { priceFrom } from "./catalog";
import { imageSrc } from "./product-image";

/**
 * Same fallback pattern as sitemap.ts / robots.ts: NEXT_PUBLIC_SITE_URL is set
 * per-environment (localhost in dev, the live Vercel URL in production, and
 * eventually the client's own domain), so this one function is the only place
 * that decides what "this site" resolves to.
 */
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rehobothco.co.za";

export function siteUrl(): string {
  return BASE;
}

export function absoluteUrl(path: string): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The share image for pages with no photograph of their own — see scripts/make-og-image.mjs. */
export const DEFAULT_OG_IMAGE = {
  url: absoluteUrl("/brand/og-image.jpg"),
  width: 1200,
  height: 630,
  alt: "Rehoboth Herbal Co. — grown, dried and packed in Mpumalanga",
};

/**
 * The brand entity, reused by both the sitewide Organization block and as the
 * `author`/`publisher` on every article and product — the thing that tells an
 * AI answer engine or a knowledge panel who is actually behind the words,
 * distinct from ranking copy.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rehoboth Herbal Co.",
    url: siteUrl(),
    logo: absoluteUrl("/brand/wordmark-light.png"),
    description:
      "Herbs, tinctures and natural products grown, dried and packed at Rehoboth Farm, Low's Creek, Mpumalanga.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Low's Creek",
      addressRegion: "Mpumalanga",
      addressCountry: "ZA",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rehoboth Herbal Co.",
    url: siteUrl(),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * BlogPosting rather than plain Article — these are farm updates and harvest
 * notes, not journalism, and BlogPosting is the type search engines expect
 * for that. `articleBody` is left out deliberately: it would duplicate the
 * full HTML body into the page source a second time for no ranking benefit.
 */
export function newsArticleJsonLd(post: NewsPost) {
  const image = post.heroImage ?? DEFAULT_OG_IMAGE.url;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    url: absoluteUrl(`/news/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/news/${post.slug}`),
    author: { "@type": "Organization", name: "Rehoboth Herbal Co." },
    publisher: {
      "@type": "Organization",
      name: "Rehoboth Herbal Co.",
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/wordmark-light.png") },
    },
  };
}

/**
 * `product.heroImage` is a resolved Supabase URL for an admin upload, but for
 * the products shipped with the repo it is only a stem — `/products/slug` —
 * that lib/product-image.ts's imageSrc() turns into a real file at render
 * time. Structured data and OG tags aren't rendered by that component, so
 * they need the same resolution done explicitly, then made absolute: a
 * relative path is fine for Next's own metadata (metadataBase handles it)
 * but a bare JSON-LD field is read by crawlers with no base URL to resolve
 * against.
 */
export function productImageUrl(product: Product): string {
  return product.heroImage ? absoluteUrl(imageSrc(product.heroImage, 1600)) : DEFAULT_OG_IMAGE.url;
}

/**
 * Availability reflects real stock, not just whether the product is listed —
 * a product with every variant at 0 has nothing to sell, and Offer schema
 * exists precisely so a shopping surface can know that without a page fetch.
 */
export function productJsonLd(product: Product) {
  const inStock = product.variants.some((v) => v.stock > 0);
  const image = productImageUrl(product);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image,
    url: absoluteUrl(`/product/${product.slug}`),
    brand: { "@type": "Brand", name: "Rehoboth Herbal Co." },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ZAR",
      lowPrice: priceFrom(product).toFixed(2),
      offerCount: product.variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
  };
}
