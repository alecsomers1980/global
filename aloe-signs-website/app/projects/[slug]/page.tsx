import Header from '@/components/Header';
import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import ProjectReel from '@/components/ProjectReel';
import ProjectGallery from '@/components/ProjectGallery';

export const revalidate = 3600;

const SITE = 'https://aloesigns.co.za';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { rows } = await sql.query(
    'SELECT title, meta_title, meta_description, summary, cover_image_url FROM projects WHERE slug = $1 AND status = $2',
    [slug, 'PUBLISHED']
  );
  if (rows.length === 0) return { title: 'Project Not Found' };
  const p = rows[0];
  return {
    title: p.meta_title || p.title,
    description: p.meta_description || p.summary || '',
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: p.meta_title || p.title,
      description: p.meta_description || p.summary || '',
      images: p.cover_image_url ? [p.cover_image_url] : undefined,
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { rows } = await sql.query(
    'SELECT * FROM projects WHERE slug = $1 AND status = $2',
    [slug, 'PUBLISHED']
  );
  if (rows.length === 0) notFound();

  const p = rows[0];
  const gallery: string[] = Array.isArray(p.gallery) ? p.gallery : [];
  const heroImage = p.cover_image_url || gallery[0] || undefined;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    headline: p.title,
    description: p.summary || p.meta_description || '',
    url: `${SITE}/projects/${slug}`,
    image: [p.cover_image_url, ...gallery].filter(Boolean),
    dateCreated: p.created_at || undefined,
    datePublished: p.published_at || undefined,
    dateModified: p.updated_at || p.published_at || undefined,
    creator: { '@type': 'Organization', name: 'Aloe Signs' },
    locationCreated: p.location ? { '@type': 'Place', name: p.location } : undefined,
    about: p.category || undefined,
  };
  if (p.reel_url) {
    jsonLd.video = {
      '@type': 'VideoObject',
      name: `${p.title} — Aloe Signs`,
      description: p.summary || p.meta_description || p.title,
      thumbnailUrl: heroImage ? [heroImage] : undefined,
      contentUrl: p.reel_url,
      uploadDate: p.published_at || p.created_at || undefined,
    };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="min-h-screen bg-[#0B0E0D] text-white pt-28 md:pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All projects
          </Link>

          {/* Title block */}
          <div className="mb-8">
            {p.category && (
              <span className="text-aloe-green text-xs font-bold uppercase tracking-[0.2em]">
                {p.category}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black mt-3 leading-tight">{p.title}</h1>
            {(p.client || p.location) && (
              <p className="text-white/50 mt-3">
                {[p.client, p.location].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          {/* Reel */}
          {p.reel_url && (
            <div className="mb-12">
              <ProjectReel src={p.reel_url} poster={heroImage} />
            </div>
          )}

          {/* Hero image when there is no reel */}
          {!p.reel_url && heroImage && (
            <div className="mb-12 rounded-[2rem] overflow-hidden">
              <img src={heroImage} alt={p.title} className="w-full max-h-[70vh] object-cover" />
            </div>
          )}

          {/* Body */}
          {p.content && (
            <article className="prose prose-invert prose-lg max-w-3xl mx-auto prose-headings:font-bold prose-headings:text-white prose-a:text-aloe-green prose-strong:text-white prose-li:text-white/70 prose-p:text-white/70 mb-16">
              <ReactMarkdown>{p.content}</ReactMarkdown>
            </article>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <section className="mt-4">
              <h2 className="text-2xl font-bold mb-6">Gallery</h2>
              <ProjectGallery images={gallery} title={p.title} />
            </section>
          )}

          {/* CTA */}
          <div className="mt-20 text-center bg-white/5 border border-white/10 rounded-[2rem] p-10">
            <h2 className="text-2xl md:text-3xl font-black">Want work like this?</h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              Let&apos;s talk about your signage, branding or large-format printing project.
            </p>
            <Link
              href="/get-quote"
              className="inline-block mt-6 px-8 py-3 bg-aloe-green text-charcoal font-black rounded-full hover:scale-105 transition-transform"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
