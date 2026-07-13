import Header from '@/components/Header';
import Link from 'next/link';
import { sql } from '@vercel/postgres';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'News & Insights',
  description:
    'Signage, branding and large-format printing insights, guides and project stories from Aloe Signs — serving Johannesburg, Gauteng and all of South Africa.',
  alternates: {
    canonical: '/news',
  },
};

export default async function NewsIndexPage() {
  const { rows } = await sql`SELECT slug, title, excerpt, category, image_url, published_at
    FROM news_posts
    WHERE status = 'PUBLISHED'
    ORDER BY published_at DESC NULLS LAST`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0E0D] text-white pt-32 md:pt-40 pb-24">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <span className="text-aloe-green text-xs font-bold tracking-[0.3em] uppercase">
            Aloe Signs
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4">News & Insights</h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            Expert perspectives on signage, branding and large-format printing.
            Discover project stories, how‑to guides and industry updates to help your brand stand out.
          </p>
        </div>

        {/* Content */}
        {rows.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 text-center text-white/40 py-20">
            No articles published yet. Check back soon.
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rows.map((post) => (
              <Link
                key={post.slug}
                href={`/news/${post.slug}`}
                className="group block bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:-translate-y-2 hover:border-aloe-green/40 transition-all duration-500"
              >
                {/* Image or placeholder */}
                <div className="relative h-52 w-full">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#121816]" />
                  )}
                </div>

                {/* Card body */}
                <div className="p-6">
                  {post.category && (
                    <span className="text-aloe-green text-[11px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-xl font-bold mt-2 mb-2 group-hover:text-aloe-green transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-white/55 text-sm line-clamp-3">{post.excerpt}</p>
                  )}
                  <p className="text-white/30 text-xs mt-4">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}