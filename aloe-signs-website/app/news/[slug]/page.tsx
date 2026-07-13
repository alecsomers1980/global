import Header from '@/components/Header';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { rows } = await sql.query(
    'SELECT title, meta_title, meta_description, excerpt FROM news_posts WHERE slug = $1 AND status = $2',
    [slug, 'PUBLISHED']
  );

  if (rows.length === 0) {
    return { title: 'Article Not Found' };
  }

  const row = rows[0];
  return {
    title: row.meta_title || row.title,
    description: row.meta_description || row.excerpt || '',
    alternates: {
      canonical: `/news/${slug}`,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { rows } = await sql.query(
    'SELECT * FROM news_posts WHERE slug = $1 AND status = $2',
    [slug, 'PUBLISHED']
  );

  if (rows.length === 0) notFound();

  const post = rows[0];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.meta_description || '',
    image: post.image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    author: {
      '@type': 'Organization',
      name: 'Aloe Signs',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aloe Signs',
    },
    mainEntityOfPage: `https://aloesigns.co.za/news/${slug}`,
  };

  const hasImage = !!post.image_url;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-[#0B0E0D] text-white pb-24">
        {/* Hero image (optional) */}
        {hasImage && (
          <section className="relative w-full h-[45vh] md:h-[55vh]">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0D] via-[#0B0E0D]/40 to-transparent" />
          </section>
        )}

        {/* Article body */}
        <article
          className={
            hasImage
              ? 'max-w-3xl mx-auto px-6 -mt-24 relative z-10'
              : 'max-w-3xl mx-auto px-6 pt-32 md:pt-40 relative z-10'
          }
        >
          {post.category && (
            <span className="text-aloe-green text-xs font-bold uppercase tracking-[0.2em]">
              {post.category}
            </span>
          )}

          <h1 className="text-3xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            {post.title}
          </h1>

          {post.published_at && (
            <time className="block text-white/40 text-sm mb-10">
              {new Date(post.published_at).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-a:text-aloe-green prose-strong:text-white prose-li:text-white/70 prose-p:text-white/70">
            <ReactMarkdown>{post.content || ''}</ReactMarkdown>
          </div>
        </article>
      </main>
    </>
  );
}