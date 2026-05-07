import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import { sanitizeArticleHtml } from "@/lib/sanitize";

interface Props {
  params: Promise<{ slug: string }>;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: string;
  author: string;
  cta_text: string | null;
  cta_url: string | null;
  created_at: string;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/articles/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    keywords: [article.category, "HVAC", "air conditioning", "Exec-Air", "Krugersdorp"],
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image
        ? [{ url: article.image }]
        : [{ url: "/og-image.jpg", width: 1200, height: 630 }],
      type: "article",
      url: `/news/${article.slug}`,
      locale: "en_ZA",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // Get related articles
  let related: Article[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/articles?category=${encodeURIComponent(article.category)}&limit=4`);
    if (res.ok) {
      const data = await res.json();
      related = data.filter((a: Article) => a.slug !== article.slug).slice(0, 3);
    }
  } catch {}

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.created_at,
    publisher: {
      "@type": "Organization",
      name: "Exec-Air Air Conditioning",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageBanner
        title={article.title}
        subtitle={`${article.category} · ${new Date(article.created_at).toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} · ${article.author}`}
      />

      <article className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          {/* Featured Image */}
          {article.image && (
            <div className="mb-12 overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={article.image}
                alt={article.title}
                width={1200}
                height={600}
                className="w-full object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-brand-navy [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-brand-navy [&>p]:leading-relaxed [&>p]:text-brand-navy/70 [&>ul]:space-y-2 [&>li]:text-brand-navy/70 [&>strong]:text-brand-navy"
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
          />

          {/* CTA Banner */}
          <div className="mt-16 rounded-3xl bg-gradient-to-r from-brand-teal to-brand-teal/80 p-10 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              {article.cta_text || "Ready to improve your climate control?"}
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-white/80">
              Our certified team is ready to help with your HVAC needs. Get in touch today for
              expert advice and a personalised quote.
            </p>
            <Link
              href={article.cta_url || "/contact-us"}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-brand-teal transition-all hover:bg-white/90 hover:shadow-lg"
            >
              {article.cta_text ? "Learn More" : "Request a Consultation"}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <h2 className="mb-10 text-center text-2xl font-bold text-brand-navy">Related Articles</h2>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {r.image ? (
                      <Image src={r.image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-navy/5 to-brand-teal/5" />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-brand-teal">{r.category}</span>
                    <h3 className="mt-1 font-semibold text-brand-navy group-hover:text-brand-teal transition-colors">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
