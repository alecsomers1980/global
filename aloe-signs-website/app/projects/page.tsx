import Header from '@/components/Header';
import Link from 'next/link';
import { sql } from '@vercel/postgres';
import type { Metadata } from 'next';
import { Film } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Our Projects & Work',
  description:
    'See signage, vehicle branding, building wraps and large-format printing projects delivered by Aloe Signs across Johannesburg, Gauteng and South Africa.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsIndexPage() {
  let rows: any[] = [];
  try {
    const result = await sql`
      SELECT slug, title, summary, client, location, category, cover_image_url, reel_url, published_at
      FROM projects
      WHERE status = 'PUBLISHED'
      ORDER BY sort_order ASC, published_at DESC NULLS LAST`;
    rows = result.rows;
  } catch {
    rows = [];
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0B0E0D] text-white pt-32 md:pt-40 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <span className="text-aloe-green text-xs font-bold tracking-[0.3em] uppercase">Aloe Signs</span>
          <h1 className="text-4xl md:text-6xl font-black mt-4">Our Work</h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            A look at signage, branding and large-format printing projects we&apos;ve delivered for
            businesses across Gauteng and South Africa — from fleet branding to building wraps.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 text-center text-white/40 py-20">
            No projects published yet. Check back soon.
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rows.map((p) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="group block bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:-translate-y-2 hover:border-aloe-green/40 transition-all duration-500"
              >
                <div className="relative h-56 w-full bg-[#121816]">
                  {p.cover_image_url ? (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : p.reel_url ? (
                    <video
                      src={p.reel_url}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                  {p.reel_url && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      <Film className="w-3 h-3" /> Reel
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {p.category && (
                    <span className="text-aloe-green text-[11px] font-bold uppercase tracking-wider">
                      {p.category}
                    </span>
                  )}
                  <h2 className="text-xl font-bold mt-2 mb-2 group-hover:text-aloe-green transition-colors line-clamp-2">
                    {p.title}
                  </h2>
                  {p.summary && <p className="text-white/55 text-sm line-clamp-3">{p.summary}</p>}
                  {(p.client || p.location) && (
                    <p className="text-white/30 text-xs mt-4">
                      {[p.client, p.location].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
