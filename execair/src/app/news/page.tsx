import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Latest News | HVAC Insights & Expert Advice",
  description:
    "Stay informed with the latest HVAC news, tips, and insights from Exec-Air. Expert advice on air conditioning, energy efficiency, and climate control for South African homes and businesses.",
  keywords: [
    "HVAC news",
    "air conditioning tips",
    "energy efficiency South Africa",
    "HVAC maintenance",
    "climate control advice",
    "Exec-Air blog",
    "aircon tips",
    "commercial HVAC insights",
  ],
  openGraph: {
    title: "Latest News | HVAC Insights from Exec-Air",
    description:
      "Expert HVAC advice, industry insights, and practical tips for South African homes and businesses.",
  },
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  category: string;
  author: string;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/articles?limit=20`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const articles = await getArticles();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Exec-Air HVAC Insights",
    description: "Expert HVAC advice, industry news, and practical tips from Exec-Air Air Conditioning.",
    provider: {
      "@type": "Organization",
      name: "Exec-Air Air Conditioning",
      url: "https://execair.co.za",
    },
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      description: a.excerpt,
      url: `/news/${a.slug}`,
      image: a.image,
      author: { "@type": "Organization", name: a.author },
      datePublished: a.created_at,
    })),
  };

  const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageBanner
        title="LATEST NEWS"
        subtitle="Expert HVAC advice, industry insights, and practical tips to help you make informed decisions about your air conditioning and climate control needs."
      />

      {/* Article Grid */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          {articles.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg text-brand-navy/40">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className={`group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                    i === 0 ? "md:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-gray-100 ${
                      i === 0 ? "md:flex md:h-72" : "h-52"
                    }`}
                  >
                    <div
                      className={`overflow-hidden ${i === 0 ? "md:w-2/3" : "h-full w-full"}`}
                    >
                      {article.image ? (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-navy/5 to-brand-teal/5">
                          <svg className="h-12 w-12 text-brand-navy/10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col justify-center p-6 ${i === 0 ? "md:w-1/3" : ""}`}>
                      <span className="mb-2 inline-block self-start rounded-full bg-brand-sky/30 px-3 py-1 text-xs font-medium text-brand-teal">
                        {article.category}
                      </span>
                      <h2 className="text-lg font-bold leading-tight text-brand-navy group-hover:text-brand-teal transition-colors">
                        {article.title}
                      </h2>
                      <p className="mt-2 hidden text-sm leading-relaxed text-brand-navy/50 sm:line-clamp-3">
                        {article.excerpt}
                      </p>
                      <p className="mt-3 text-xs text-brand-navy/30">
                        {new Date(article.created_at).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-navy py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Need professional HVAC advice?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60">
            Our team of certified experts is ready to help with your air conditioning and
            ventilation needs. Get in touch for a consultation tailored to your requirements.
          </p>
          <Link href="/contact-us" className="btn-primary text-lg">
            Get a Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
