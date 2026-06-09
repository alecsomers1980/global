import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Calendar, Trophy, BookOpen, Users, Heart, Clock, Mail } from "lucide-react";
import type { Metadata } from "next";
import NewsletterHeader from "@/components/NewsletterHeader";
import SecondaryBanner from "@/components/SecondaryBanner";
import SubscribeButton from "@/components/SubscribeButton";
import { createServerSupabase } from "@/lib/supabase-server";

// ─── SECTION RENDERERS ────────────────────────────────────────────────────────

function ContentBody({ text }: { text: string }) {
  if (!text) return null;
  const paragraphs = text.split('\n\n').filter(Boolean);
  return (
    <div className="space-y-6">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-brand-green/75 leading-relaxed text-[1.05rem]">
          {p}
        </p>
      ))}
    </div>
  );
}

function SectionIcon({ icon }: { icon: string }) {
  const cls = "w-5 h-5";
  switch (icon) {
    case "trophy": return <Trophy className={cls} />;
    case "book": return <BookOpen className={cls} />;
    case "users": return <Users className={cls} />;
    case "calendar": return <Calendar className={cls} />;
    default: return <Heart className={cls} />;
  }
}

function getDefaultIconForType(type: string) {
  switch (type) {
    case 'sport': return 'trophy';
    case 'academic': return 'book';
    case 'dates': return 'calendar';
    case 'event': return 'users';
    case 'head':
    case 'preschool':
    case 'content':
    default: return 'heart';
  }
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

// Opt-out of static rendering 
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("newsletters").select("*").eq("slug", params.slug).single();
  if (!data) return { title: "Not Found" };
  
  return {
    title: `${data.title} | Riverview Preparatory School`,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      type: "article",
      publishedTime: data.publish_date,
      images: data.hero_image ? [{ url: data.hero_image }] : [],
    },
  };
}

export default async function NewsletterArticle({ params }: { params: { slug: string } }) {
  const supabase = await createServerSupabase();
  
  // 1. Fetch newsletter details
  const { data: newsletter, error: nlErr } = await supabase
    .from("newsletters")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (nlErr || !newsletter) notFound();

  // 2. Fetch sections
  const { data: sections } = await supabase
    .from("newsletter_sections")
    .select("*")
    .eq("newsletter_id", newsletter.id)
    .order("sort_order", { ascending: true });

  // 3. Fetch "Other editions"
  const { data: otherEditions } = await supabase
    .from("newsletters")
    .select("slug, title, headline, publish_date, hero_image")
    .eq("is_published", true)
    .neq("id", newsletter.id)
    .order("publish_date", { ascending: false })
    .limit(3);

  const formattedDate = new Date(newsletter.publish_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' });
  const highlights = Array.isArray(newsletter.highlights) ? newsletter.highlights : [];
  const secs = sections || [];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SecondaryBanner 
        title="Weekly Newsletters" 
        subtitle={`${newsletter.term || ''} ${newsletter.issue_number ? `· ${newsletter.issue_number}` : ''} · ${formattedDate}`}
      />

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-0 bg-white overflow-hidden">
        <div className="container mx-auto px-6 mb-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-brand-green/40 hover:text-brand-gold transition-colors text-xs uppercase tracking-widest font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Weekly Newsletters
          </Link>
        </div>

        <div className="container mx-auto px-6">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl">
            <NewsletterHeader
              issue={newsletter.issue_number}
              term={newsletter.term}
              date={formattedDate}
              category="Newsletter"
              title={newsletter.headline || newsletter.title}
              highlights={highlights}
            />
          </div>
        </div>
      </section>

      {/* ── Article Body ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-16 items-start">
            
            {/* Main Content */}
            <div className="space-y-16">
              
              {/* Optional Hero Description from subheadline */}
              {newsletter.subheadline && (
                <p className="text-2xl font-serif text-brand-green leading-relaxed px-4 border-l-4 border-brand-gold">
                  {newsletter.subheadline}
                </p>
              )}

              {secs.map((section: any) => {
                const sType = section.section_type || 'content';
                const ex = section.extra_data || {};
                
                // Achievement Banner
                if (sType === 'achievement') {
                  return (
                    <div key={section.id} className="bg-brand-green rounded-[2rem] p-8 text-white shadow-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-5 h-5 text-brand-gold" />
                        <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">
                          Achievement
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-1">{section.title}</h4>
                      <p className="text-brand-gold/80 text-lg font-bold mb-6">
                        {ex.athlete}
                      </p>
                      <ContentBody text={section.body} />
                    </div>
                  );
                }

                // Important Dates List
                if (sType === 'dates') {
                  return (
                    <div key={section.id}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-brand-green flex items-center justify-center text-brand-gold shadow-lg">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="telemetry-monospace text-brand-green text-xl m-0">{section.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {(ex.items || []).map((item: any, ii: number) => (
                          <div key={ii} className="flex gap-6 p-6 rounded-[1.5rem] border border-brand-green/8 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-lg transition-all duration-300">
                             <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center bg-brand-green text-white rounded-2xl py-3 px-2 text-center shadow-md">
                              <Calendar className="w-4 h-4 text-brand-gold mb-1" />
                              <span className="text-[10px] font-bold leading-tight">{item.date}</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                              <p className="text-sm text-brand-green/70 leading-relaxed m-0">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Event Spotlight
                if (sType === 'event') {
                  return (
                    <div key={section.id} className="rounded-[3rem] overflow-hidden border border-brand-green/8 shadow-2xl flex flex-col md:flex-row bg-brand-cream hover:-translate-y-1 transition-transform duration-500">
                      <div className="relative w-full md:w-[45%] h-64 md:h-auto overflow-hidden bg-brand-green">
                        {section.image_url ? (
                          <Image src={section.image_url} alt={section.title} fill className="object-cover object-top" unoptimized />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Users className="w-24 h-24 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-cream/10" />
                      </div>
                      <div className="p-8 md:p-12 md:w-[55%] flex flex-col justify-center">
                        <div className="mb-6">
                          <span className="px-3 py-1 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block shadow-sm">
                            Event Spotlight
                          </span>
                          <h3 className="text-3xl font-bold text-brand-green leading-tight mb-2">
                            {section.title}
                          </h3>
                          {ex.subtitle && (
                            <p className="text-brand-gold font-serif italic text-xl">
                              {ex.subtitle}
                            </p>
                          )}
                        </div>
                        <p className="text-brand-green/70 leading-relaxed mb-8 text-[1.05rem]">
                          {section.body}
                        </p>
                        {ex.ctaHref && (
                          <div className="mt-auto">
                            <Link href={ex.ctaHref} className="inline-flex items-center gap-3 px-8 py-4 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green/90 transition-all hover:shadow-lg text-sm group">
                              View Event Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Standard Blocks (Head, Sport, Academic, Preschool, Content)
                const layout = ex.layout || 'standard';
                const gallery: string[] = ex.gallery || (section.image_url ? [section.image_url] : []);
                const hasImages = gallery.length > 0;

                // ─── PREMIUM LAYOUT: HERO ───────────────────────────────────
                if (layout === 'hero' && hasImages) {
                  return (
                    <div key={section.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <div className="relative w-full aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                        <Image src={gallery[0]} alt={section.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-green/40 to-transparent" />
                        <div className="absolute bottom-12 left-12 right-12">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-white shadow-lg">
                              <SectionIcon icon={section.icon || getDefaultIconForType(sType)} />
                            </div>
                            <h3 className="text-3xl font-bold text-white m-0 drop-shadow-md">
                              {section.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      <div className="max-w-3xl mx-auto text-center px-4">
                         <ContentBody text={section.body} />
                         {section.author && (
                          <div className="mt-6 font-serif italic text-brand-gold text-lg">— {section.author}</div>
                        )}
                      </div>
                    </div>
                  );
                }

                // ─── PREMIUM LAYOUT: MAGAZINE / SPLIT ────────────────────────
                if ((layout === 'magazine' || layout === 'magazine_reverse' || layout === 'split') && hasImages) {
                  const isReverse = layout === 'magazine_reverse';
                  const isSplit = layout === 'split';
                  
                  return (
                    <div key={section.id} className={`flex flex-col ${isReverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center py-12 border-b border-brand-green/5 last:border-0`}>
                      <div className={`w-full ${isSplit ? 'md:w-1/2' : 'md:w-[45%]'} space-y-4`}>
                        <div className={`relative aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white group`}>
                          <Image src={gallery[0]} alt={section.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {gallery.length > 1 && (
                          <div className="grid grid-cols-3 gap-3">
                            {gallery.slice(1, 4).map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                <Image src={img} alt="Gallery" fill className="object-cover" unoptimized />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`w-full ${isSplit ? 'md:w-1/2' : 'md:w-[55%]'} space-y-6`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-brand-cream flex items-center justify-center text-brand-green shadow-sm border border-brand-green/5">
                            <SectionIcon icon={section.icon || getDefaultIconForType(sType)} />
                          </div>
                          <div>
                            <h3 className="telemetry-monospace text-brand-green text-2xl m-0 leading-tight">
                              {section.title}
                            </h3>
                            {section.author && (
                              <div className="text-sm text-brand-gold font-bold uppercase tracking-widest mt-1">
                                {section.author}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-brand max-w-none">
                          <ContentBody text={section.body} />
                        </div>
                      </div>
                    </div>
                  );
                }

                // ─── STANDARD LAYOUT ────────────────────────────────────────
                return (
                  <div key={section.id} className="animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-brand-green flex items-center justify-center text-brand-gold shadow-lg">
                        <SectionIcon icon={section.icon || getDefaultIconForType(sType)} />
                      </div>
                      <div>
                        <h3 className="telemetry-monospace text-brand-green text-xl m-0 leading-none">
                          {section.title}
                        </h3>
                        {section.author && (
                          <div className="text-sm text-brand-green/50 font-semibold mt-1">
                            {section.author}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Gallery / Images rendering */}
                    {(() => {
                      if (gallery.length === 0) return null;
                      
                      if (gallery.length === 1) {
                        return (
                          <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-8 shadow-xl border-4 border-white group">
                            <Image src={gallery[0]} alt={section.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-green/10 to-transparent" />
                          </div>
                        );
                      }
                      
                      return (
                        <div className={`grid gap-4 mb-8 ${gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                          {gallery.map((img: string, idx: number) => {
                            const isFeatured = gallery.length === 3 && idx === 0;
                            return (
                              <div key={idx} className={`relative rounded-xl overflow-hidden shadow-md border-4 border-white group ${isFeatured ? 'col-span-2 md:col-span-3 aspect-[21/9]' : 'aspect-square'}`}>
                                <Image src={img} alt={`${section.title} image ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <ContentBody text={section.body} />
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8 lg:sticky lg:top-32">
              {/* Issue info */}
              <div className="bg-brand-cream rounded-[2rem] p-8 border border-brand-green/5 shadow-sm">
                <div className="telemetry-monospace text-brand-green mb-6">THIS EDITION</div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">Published</p>
                      <p className="font-semibold text-sm text-brand-green">{formattedDate}</p>
                    </div>
                  </div>
                  {newsletter.issue_number && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">Edition</p>
                        <p className="font-semibold text-sm text-brand-green">{newsletter.issue_number}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">Reading Time</p>
                      <p className="font-semibold text-sm text-brand-green">{Math.max(2, secs.length * 1.5)} minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscribe */}
              <div className="border hover:border-brand-gold/50 transition-colors border-brand-green/10 rounded-[2rem] p-8 bg-white shadow-sm">
                <Mail className="w-8 h-8 text-brand-gold mb-5" />
                <h4 className="font-bold text-xl mb-3 text-brand-green leading-tight">
                  Subscribe to the Reporter
                </h4>
                <p className="text-sm text-brand-green/60 leading-relaxed mb-6">
                  Get every edition of the Riverview Reporter delivered straight to your inbox.
                </p>
                <SubscribeButton variant="green" className="w-full justify-center text-sm px-6 py-3.5 rounded-xl group" />
              </div>

              {/* Nav to other edition */}
              {otherEditions && otherEditions.length > 0 && (
                <div className="border border-brand-green/10 rounded-[2rem] p-8 bg-white shadow-sm">
                  <div className="telemetry-monospace text-brand-green mb-6">OTHER EDITIONS</div>
                  <div className="space-y-6">
                    {otherEditions.map((n: any) => {
                      const nDate = new Date(n.publish_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
                      return (
                        <Link key={n.slug} href={`/news/${n.slug}`} className="group flex items-start gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-brand-green/10 shadow-sm">
                            <Image src={n.hero_image || 'https://images.unsplash.com/photo-1546410731-13b1f19331cf?q=80'} alt="Cover" fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center h-16">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-1">{nDate}</p>
                            <p className="font-bold text-sm leading-snug text-brand-green group-hover:text-brand-gold transition-colors line-clamp-2">
                              {n.headline || n.title}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream border-t border-brand-green/5">
        <div className="container mx-auto px-6 text-center">
          <div className="telemetry-monospace text-brand-green mb-4">STAY CONNECTED</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand-green">
            Enjoyed this <span className="drama-text text-brand-gold block md:inline mt-2 md:mt-0">Edition?</span>
          </h2>
          <p className="text-brand-green/60 mb-10 max-w-lg mx-auto text-lg">
            Never miss a Riverview Reporter — subscribe to receive every digital edition directly in your inbox as soon as it is published.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SubscribeButton variant="green">
              Subscribe Newsletter <ArrowRight className="w-4 h-4" />
            </SubscribeButton>
            <Link
              href="/news"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand-green font-bold rounded-full hover:bg-brand-gold border border-brand-green/10 hover:border-transparent hover:text-white transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <BookOpen className="w-4 h-4" /> Browse Archive
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
