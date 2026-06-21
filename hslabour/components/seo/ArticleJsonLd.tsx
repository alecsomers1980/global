import { company } from "@/lib/site/company";

function abs(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${company.url}${url}`;
}

/** Article structured data for insight posts (SEO + GEO). */
export default function ArticleJsonLd({
  title,
  description,
  image,
  datePublished,
  slug,
}: {
  title: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | null;
  slug: string;
}) {
  const img = abs(image);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || undefined,
    image: img ? [img] : undefined,
    datePublished: datePublished || undefined,
    dateModified: datePublished || undefined,
    author: { "@type": "Organization", name: company.name },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: { "@type": "ImageObject", url: company.logo },
    },
    mainEntityOfPage: `${company.url}/insights/${slug}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
