import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CommunityPulse from "@/components/Features";
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/media';
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Clock, Activity, Target, Megaphone, User } from "lucide-react";

export const revalidate = 60;

const CATEGORIES = ["Community", "Crime", "Lifestyle", "Notice", "Politics", "Sports"];

function stripHtml(html: string) {
  if (!html) return "";
  // Strip tags, then replace literal newlines/multiple spaces, then decode common entities
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\sn\s/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export default async function Home() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('title, slug, content, featured_image, published_at')
    .eq('status', 'publish')
    .order('published_at', { ascending: false })
    .limit(12);

  const topStory = posts?.[0] ?? null;
  const sidebarPosts = posts?.slice(1, 4) ?? [];
  const gridStories = posts?.slice(4) ?? [];

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      <Navbar />

      {/* ── HERO ── */}
      {topStory ? (
        <Hero
          post={topStory}
          imageUrl={getImageUrl(topStory.featured_image)}
          sidebarPosts={sidebarPosts}
          sidebarImageUrls={sidebarPosts.map(p => getImageUrl(p.featured_image))}
        />
      ) : (
        <Hero />
      )}

      {/* ── LEADERBOARD AD - EDITORIAL STYLE ── */}
      <div className="w-full border-y border-zinc-200 bg-zinc-50 py-6 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <span className="hidden md:block news-badge text-zinc-500 border-zinc-200 bg-transparent">AD // SPONSOR</span>
            <div className="flex-1 w-full max-w-4xl h-[100px] rounded-lg border border-[#E60000]/20 bg-[linear-gradient(45deg,rgba(230,0,0,0.02)_25%,transparent_25%,transparent_50%,rgba(230,0,0,0.02)_50%,rgba(230,0,0,0.02)_75%,transparent_75%,transparent)] bg-[length:10px_10px] flex items-center justify-center gap-5 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E60000]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Target className="text-[#E60000] w-8 h-8 flex-shrink-0" />
              <div>
                <p className="text-sm text-zinc-500 font-sans font-bold tracking-widest uppercase">
                  Premium Brand Placement
                </p>
                <p className="text-xl text-zinc-900 font-display font-medium mt-1">
                  Reach 50,000+ local readers daily. <a href="/advertise" className="text-[#E60000] hover:text-[#CC0000] transition-colors border-b border-[#E60000]/50 pb-0.5">Start Campaign →</a>
                </p>
              </div>
            </div>
            <span className="hidden md:block news-badge text-zinc-500 border-zinc-200 bg-transparent">728×90</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="w-full !bg-white/95 border-b border-zinc-200 py-4 overflow-x-auto scrollbar-hide sticky top-[90px] md:top-[105px] z-40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex gap-3 flex-nowrap items-center">
          <div className="flex-shrink-0 flex items-center gap-2 mr-2">
            <Activity className="text-[#E60000] w-4 h-4" />
            <span className="text-[11px] text-zinc-500 font-sans font-bold uppercase tracking-widest">Filters</span>
          </div>
          <div className="flex-shrink-0 h-4 w-px bg-zinc-200 mr-2"></div>
          {CATEGORIES.map((cat, i) => (
            <a
              key={cat}
              href={`/${cat.toLowerCase().replace(/ /g, '-')}`}
              className={`flex-shrink-0 text-[12px] font-sans font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-300 ${i === 0
                ? "bg-[#E60000] text-white border border-[#E60000]/30 shadow-md"
                : "bg-transparent border border-zinc-200 text-zinc-600 hover:bg-[#E60000]/5 hover:text-[#E60000] hover:border-[#E60000]/50"
                }`}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* ── News Feed (8 cols) ── */}
          <div className="lg:col-span-8">
            <div className="section-divider !border-zinc-200">
              <span className="!text-zinc-900 !border-l-[#E60000]">Latest Stories</span>
            </div>

            {error ? (
              <p className="text-[#E60000] font-sans font-medium text-sm border border-[#E60000]/30 bg-[#E60000]/10 p-4 rounded-lg">Error loading stories: {error.message}</p>
            ) : (
              <div className="flex flex-col gap-10">
                {(gridStories.length > 0 ? gridStories : PLACEHOLDER_NEWS).map((post, i) => {
                  const isReal = gridStories.length > 0;
                  const ph = post as typeof PLACEHOLDER_NEWS[0];
                  const rp = post as typeof gridStories[0];
                  const isFeatured = i === 0;

                  return (
                    <article key={i} className="group">
                      {/* In-feed Ad every 4 articles */}
                      {i > 0 && i % 4 === 0 && (
                        <div className="mb-10 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-200 bg-zinc-100/50">
                            <span className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-[0.2em]">Sponsored Insights</span>
                            <Megaphone size={14} className="text-[#E60000]/40" />
                          </div>
                          <div className="h-40 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200')] bg-cover bg-center flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80"></div>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-30"></div>
                            <div className="relative z-10 text-center px-8">
                              <h4 className="text-white font-display text-xl md:text-2xl font-bold mb-2 tracking-tight">Scale Your Local Enterprise with Cloud-First Intelligence</h4>
                              <p className="text-zinc-300 font-sans text-sm md:text-base mb-4">
                                Join our upcoming technology briefing for local business leaders.
                              </p>
                              <a href="/advertise" className="inline-flex items-center gap-2 text-[#E60000] font-sans font-bold text-xs uppercase tracking-widest hover:text-white transition-colors border border-[#E60000]/30 hover:bg-[#E60000] px-4 py-2 rounded-full">
                                Reserve Seat <ArrowRight size={14} />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Article news-card */}
                      <Link
                        href={isReal ? `/article/${rp.slug}` : "#"}
                        className={`news-card block !bg-white !border-zinc-200 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isFeatured ? "border-t-4 border-t-[#E60000]" : ""
                          }`}
                      >
                        <div className={`flex flex-col ${isFeatured ? "md:flex-row" : "sm:flex-row"} gap-0`}>
                          {/* Image wrapper */}
                          <div className={`relative flex-shrink-0 ${isFeatured ? "w-full md:w-[45%] h-[260px] md:h-[320px]" : "w-full sm:w-56 h-[200px] sm:h-48"
                            } overflow-hidden bg-zinc-100 border-b ${isFeatured ? "md:border-b-0 md:border-r" : "sm:border-b-0 sm:border-r"} border-zinc-100`}>
                            {isReal ? (
                              <Image
                                src={getImageUrl(rp.featured_image)}
                                alt={rp.title}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                              />
                            ) : (
                              <img
                                src={ph.image}
                                alt={ph.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                              />
                            )}
                            {/* Category Badge on Image */}
                            <div className="absolute top-4 left-4 z-10">
                              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-sm border border-white/10">
                                {isReal ? "Editorial" : ph.tag}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className={`flex flex-col p-6 md:p-8 flex-1 min-w-0`}>
                            <div className="flex items-center gap-4 mb-4 text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-400">
                              <time className="flex items-center gap-1.5 border-r border-zinc-200 pr-4">
                                <Clock size={12} className="text-[#E60000]" /> {isReal ? format(new Date(rp.published_at), "MMM d, yyyy") : ph.date}
                              </time>
                              <span className="flex items-center gap-1.5">
                                <Activity size={12} className="text-[#E60000]/50" /> 4m Read Time
                              </span>
                            </div>

                            <h3 className={`${isFeatured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                              } font-display font-bold text-zinc-900 mb-4 leading-[1.2] group-hover:text-[#E60000] transition-colors duration-300`}>
                              {isReal ? rp.title : ph.title}
                            </h3>

                            <p className={`${isFeatured ? "text-base" : "text-[15px]"
                              } text-zinc-600 line-clamp-3 leading-relaxed mb-6`}>
                              {isReal ? stripHtml(rp.content).substring(0, 180) + '...' : ph.excerpt}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-5 border-t border-zinc-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#E60000]/10 flex items-center justify-center border border-[#E60000]/20">
                                  <User size={12} className="text-[#E60000]" />
                                </div>
                                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500">Editorial Staff</span>
                              </div>
                              <span className="flex items-center gap-2 text-[#E60000] text-[11px] font-sans font-bold tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                                View News <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Load more */}
            <div className="mt-12 text-center">
              <button className="btn-primary flex items-center justify-center gap-3 mx-auto px-8 !py-3 bg-[#E60000] text-white border-[#E60000]">
                Load More Stories <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* ── Sticky Sidebar (4 cols) ── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-8">

              {/* Minimal Weather Widget */}
              <div className="news-card !bg-white !border-zinc-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-3">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#E60000] flex items-center gap-2">
                    <span className="live-indicator"></span> BBG Weather
                  </span>
                  <span className="text-[11px] text-zinc-500 font-sans uppercase font-medium">Local Data</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-6xl font-display font-bold text-zinc-900 leading-none">24°</div>
                    <div className="text-sm text-[#E60000] font-sans font-semibold mt-1 uppercase tracking-widest">Partly Cloudy</div>
                  </div>
                  <div className="w-16 h-16 rounded-full border border-[#E60000]/20 flex items-center justify-center bg-[#E60000]/5 shadow-[0_4px_15px_rgba(230,0,0,0.05)]">
                    <span className="text-2xl">🌤️</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 border-t border-zinc-100 pt-4">
                  {[{ d: "MO", t: "26°" }, { d: "TU", t: "22°" }, { d: "WE", t: "28°" }, { d: "TH", t: "21°" }].map(w => (
                    <div key={w.d} className="text-center bg-zinc-50 py-2 rounded-lg border border-zinc-100">
                      <div className="text-[10px] font-sans font-bold text-zinc-500 uppercase">{w.d}</div>
                      <div className="text-sm font-bold text-zinc-900 mt-1">{w.t}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sponsor Block */}
              <div className="news-card !bg-white !border-zinc-200 overflow-hidden group shadow-[0_4px_20px_rgba(230,0,0,0.05)]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-zinc-500">Featured Sponsor</span>
                  <span className="news-badge !text-zinc-500 !border-zinc-300 !bg-transparent">AD</span>
                </div>
                <div className="p-6">
                  <div className="h-32 rounded-lg bg-zinc-900 flex items-center justify-center mb-5 relative overflow-hidden border border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black"></div>
                    <Target className="text-[#E60000] w-12 h-12 relative z-10" />
                  </div>
                  <h4 className="text-lg font-display text-zinc-900 mb-2 leading-tight">Next-Gen Local Network Expansion</h4>
                  <p className="text-sm text-zinc-600 mb-5 leading-relaxed font-sans">
                    Accelerate your workloads with our hyper-scaled datacenters based directly in Mpumalanga.
                  </p>
                  <a href="#" className="btn-primary w-full flex justify-center py-2.5 text-xs">
                    View Enterprise Plans
                  </a>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </section>

      {/* ── COMMUNITY FEED ── */}
      <CommunityPulse />

      {/* ── FULL-WIDTH AD BREAK - EDITORIAL VERSION ── */}
      <div className="w-full border-y border-[#E60000]/20 bg-zinc-50 py-8 relative z-10 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[100px] bg-[#E60000]/5 blur-[80px] rounded-full"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="w-full flex flex-col md:flex-row items-center justify-between p-8 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-md gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#E60000]/10 border border-[#E60000]/20 flex items-center justify-center text-[#E60000]">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-lg text-zinc-900 font-display font-bold">Showcase your brand to the region</p>
                <p className="text-sm text-zinc-500 font-sans mt-1">High-visibility placements available in premium leaderboard sizes.</p>
              </div>
            </div>
            <a href="/advertise" className="btn-primary flex-shrink-0 whitespace-nowrap">
              Contact Sales Team
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#F9FAFB] text-zinc-900 pt-16 pb-8 border-t border-zinc-200 relative z-10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

            {/* Brand */}
            <div className="md:col-span-5 pr-0 md:pr-10">
              <div className="mb-6 relative w-48 h-10">
                <Image src="/Bushnews.png" alt="Bushbuckridge News Logo" fill className="object-contain object-left" unoptimized />
              </div>
              <p className="text-sm text-zinc-600 font-sans leading-relaxed mb-8 max-w-sm">
                Real-time, authoritative local news from Bushbuckridge. We deliver the stories that empower our community with transparency and depth.
              </p>
              <div className="flex gap-3">
                {[{ label: "X", color: "" }, { label: "FB", color: "" }, { label: "YT", color: "" }].map(s => (
                  <a key={s.label} href="#" className="w-10 h-10 rounded-full border border-zinc-200 bg-white hover:bg-[#E60000] flex items-center justify-center text-[12px] font-sans font-bold text-zinc-500 hover:text-white hover:border-[#E60000] transition-all duration-300 shadow-sm">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-2">
              <h4 className="text-[12px] font-sans font-bold uppercase tracking-widest text-[#E60000] mb-6">Sections</h4>
              <ul className="space-y-4">
                {["Local News", "Business", "Sports", "Culture", "Politics"].map(l => (
                  <li key={l}><a href="#" className="text-sm text-zinc-600 hover:text-[#E60000] hover:translate-x-1 inline-block transition-all font-sans font-medium">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[12px] font-sans font-bold uppercase tracking-widest text-[#E60000] mb-6">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Contact", "Advertise", "Careers", "Privacy Policy"].map(l => (
                  <li key={l}><a href="#" className="text-sm text-zinc-600 hover:text-[#E60000] transition-colors font-sans font-medium">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-3">
              <h4 className="text-[12px] font-sans font-bold uppercase tracking-widest text-[#E60000] mb-6">Morning Briefing</h4>
              <p className="text-sm text-zinc-600 font-sans mb-5 leading-relaxed">
                Get the top local stories delivered straight to your inbox daily.
              </p>
              <form className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg bg-white border border-zinc-200 shadow-sm text-sm text-zinc-900 font-sans placeholder-zinc-400 focus:outline-none focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000]/20 transition-all"
                />
                <button type="submit" className="btn-primary w-full py-3">
                  Subscribe Now
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-zinc-500 font-sans font-medium uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Bushbuckridge News. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 text-[#E60000] text-[11px] font-sans font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse"></span>
              Live Updates Active
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

const PLACEHOLDER_NEWS = [
  {
    title: "Regional Economic Transformation: Bushbuckridge CBD Infrastructure Project Breaks Ground",
    tag: "Development",
    excerpt: "The Multi-Million Rand CBD revitalization project marks a turning point for local commerce, introducing sustainable smart-grid technology and dedicated enterprise zones.",
    date: "2h ago",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Pan-African Conservation Summit: Global Experts Convene at Kruger Gate",
    tag: "Environment",
    excerpt: "Leading biologists and environmental policymakers gather to discuss data-driven preservation strategies for Southern African wildlife corridors during the week-long summit.",
    date: "5h ago",
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Digital Literacy Initiative: Bridging the Divide in Rural Mpumalanga Schools",
    tag: "Education",
    excerpt: "A new collaborative framework between telecommunications leaders and local government aims to equip 50 community schools with fiber-optic connectivity and high-performance labs.",
    date: "12h ago",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Agricultural Innovation: Hydroponic Startup Success in Ehlanzeni District",
    tag: "Business",
    excerpt: "Transforming traditional farming methods, local agritech entrepreneurs are seeing record yields through climate-controlled vertical farming systems funded by the recent startup grant.",
    date: "Yesterday",
    image: "https://images.unsplash.com/photo-1558449028-b53a39d10006?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Community Safety Report: Integrated Response Systems Show 15% Reduction in Incidents",
    tag: "Security",
    excerpt: "New tech-driven community policing initiatives and rapid response protocols are yielding positive results in the greater Bushbuckridge municipal area.",
    date: "2 days ago",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Cultural Heritage Preservation: Annual Festival Announces Global Livestream Partnership",
    tag: "Culture",
    excerpt: "Showcasing the rich traditions of the region to a global audience, the upcoming heritage festival will feature high-definition immersive broadcasting for the first time.",
    date: "3 days ago",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
  },
];
