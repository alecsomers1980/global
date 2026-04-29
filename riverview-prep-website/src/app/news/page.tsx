import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Trophy, Users, Calendar } from "lucide-react";
import NewsletterHeader from "@/components/NewsletterHeader";
import SecondaryBanner from "@/components/SecondaryBanner";
import FallbackImage from "@/components/FallbackImage";
import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "School News & Newsletters | Riverview Preparatory School",
  description:
    "Stay up to date with the latest news, events, and highlights from Riverview Preparatory School in Malelane, Mpumalanga. Read our Riverview Reporter newsletters.",
  keywords: [
    "Riverview Prep news",
    "school newsletter",
    "Riverview Reporter",
    "school events Malelane",
    "primary school news Mpumalanga",
  ],
  openGraph: {
    title: "School News & Newsletters | Riverview Preparatory School",
    description:
      "Stay up to date with the latest news and events from Riverview Prep.",
    type: "website",
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  Sports: <Trophy className="w-3.5 h-3.5" />,
  Academic: <BookOpen className="w-3.5 h-3.5" />,
  Community: <Users className="w-3.5 h-3.5" />,
  Culture: <Calendar className="w-3.5 h-3.5" />,
};

const categoryColours: Record<string, string> = {
  Sports: "bg-brand-gold text-white",
  Academic: "bg-brand-green text-white",
  Community: "bg-purple-600 text-white",
  Culture: "bg-rose-500 text-white",
  Newsletter: "bg-brand-green text-white",
};

export const revalidate = 60; // Revalidate every minute

export default async function NewsPage() {
  const supabase = await createServerSupabase();

  const { data: articlesData, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false });

  if (error || !articlesData || articlesData.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <SecondaryBanner title="Weekly Newsletters" subtitle="The latest from campus community" />
        <section className="py-32 text-center">
          <div className="telemetry-monospace text-brand-green mb-4">CHECK BACK SOON</div>
          <h2 className="text-3xl font-bold mb-4">No editions published yet.</h2>
          <p className="text-brand-green/60">We are currently preparing our next newsletter.</p>
        </section>
        <Footer />
      </main>
    );
  }

  // Format the DB data
  const articles = articlesData.map((nl: any) => ({
    slug: nl.slug,
    term: nl.term || '',
    issue: nl.issue_number || '',
    date: new Date(nl.publish_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }),
    category: "Newsletter", // Ensure it passes type check in NewsletterHeader
    highlights: Array.isArray(nl.highlights) ? nl.highlights : [],
    title: nl.title || 'Newsletter',
    subtitle: nl.headline || nl.title,
    excerpt: nl.excerpt || '',
    image: (!nl.hero_image || nl.hero_image.includes('placeholder')) ? "/images/banner.jpg" : nl.hero_image,
    tags: Array.isArray(nl.highlights) ? nl.highlights.slice(0, 3) : [],
    readTime: "4 min read", // Can be dynamic logically
  }));

  const [featured, ...rest] = articles;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <SecondaryBanner 
        title="Weekly Newsletters" 
        subtitle="The latest from campus community"
      />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="telemetry-monospace text-brand-green mb-10">
            LATEST EDITION
          </div>

          <Link href={`/news/${featured.slug}`} className="group block">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-[3rem] overflow-hidden border border-brand-green/8 hover:shadow-2xl transition-all duration-700 hover:-translate-y-1">
              {/* Header Banner */}
              <div className="lg:col-span-3 h-full relative min-h-[20rem] lg:min-h-full overflow-hidden">
                <FallbackImage
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-gold"></span>
                  <span className="text-xs uppercase font-bold tracking-widest text-brand-green">{featured.category}</span>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-2 bg-brand-cream p-10 lg:p-14 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="telemetry-monospace text-brand-green/50">
                    {featured.issue}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold mb-3">
                  {featured.date} · {featured.readTime}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 group-hover:text-brand-green transition-colors">
                  {featured.title}
                </h2>
                <p className="text-brand-green/60 leading-relaxed mb-8 text-sm">
                  {featured.subtitle}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {featured.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${categoryColours[tag] || 'bg-brand-green text-white'}`}
                    >
                      {categoryIcons[tag]}
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand-green group-hover:text-brand-gold transition-colors">
                  Read Full Edition{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="pb-28">
          <div className="container mx-auto px-6">
            <div className="telemetry-monospace text-brand-green mb-10">
              PREVIOUS EDITIONS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((article: any) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className="group block h-full"
                >
                  <article className="h-full rounded-[2rem] overflow-hidden border border-brand-green/8 hover:border-brand-gold/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white flex flex-col">
                    <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
                      <FallbackImage
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm z-10">
                        <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-green">{article.category}</span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold">
                          {article.date}
                        </span>
                        {article.issue && <span className="text-[10px] text-brand-green/40 font-bold uppercase tracking-widest">· {article.issue}</span>}
                      </div>
                      <h3 className="font-bold text-xl leading-snug mb-4 group-hover:text-brand-green transition-colors flex-none line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-brand-green/60 leading-relaxed mb-6 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-green/5">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${categoryColours[tag] || 'bg-brand-green/5 text-brand-green'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="w-8 h-8 rounded-full border border-brand-green/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:border-brand-gold group-hover:text-white transition-all text-brand-green flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              <div className="rounded-[2rem] bg-brand-green p-10 flex flex-col justify-between min-h-[400px]">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-gold/20 flex items-center justify-center mb-8">
                    <BookOpen className="w-6 h-6 text-brand-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight mb-4">
                    Never Miss an{" "}
                    <span className="drama-text text-brand-gold">Edition.</span>
                  </h3>
                  <p className="text-white/60 leading-relaxed text-sm">
                    Subscribe to receive the Riverview Reporter directly in your
                    inbox every fortnight during term time.
                  </p>
                </div>
                <Link
                  href="/#newsletter"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-brand-gold/90 transition-colors text-sm mt-8 self-start"
                >
                  Subscribe <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
