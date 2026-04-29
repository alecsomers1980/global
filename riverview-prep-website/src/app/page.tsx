import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HexagonShowcase from "@/components/HexagonShowcase";
import NewsletterHeader from "@/components/NewsletterHeader";
import EventPosterSlider from "@/components/EventPosterSlider";
import PublicCalendar from "@/components/PublicCalendar";
import FallbackImage from "@/components/FallbackImage";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  Calendar,
  Shield,
  Heart,
  Star,
  MapPin,
  Loader2,
  ArrowRight,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const coreValues = [
  {
    name: "Love",
    icon: <Heart className="w-8 h-8" />,
    colour: "from-rose-50 to-red-50",
    accentBorder: "border-rose-200",
    iconColour: "text-rose-500",
    tagColour: "bg-rose-100 text-rose-700",
    subValues: ["Self-worth and Growth", "Motivation", "Humour"],
    desc: "Nurturing an environment of unconditional acceptance, warmth, and mutual respect.",
  },
  {
    name: "Faith",
    icon: <Star className="w-8 h-8" />,
    colour: "from-amber-50 to-yellow-50",
    accentBorder: "border-amber-200",
    iconColour: "text-amber-500",
    tagColour: "bg-amber-100 text-amber-700",
    subValues: ["Consistency", "Loyalty", "Hard Work"],
    desc: "Staying true to our heritage through unwavering commitment and spiritual growth.",
  },
  {
    name: "Integrity",
    icon: <Shield className="w-8 h-8" />,
    colour: "from-emerald-50 to-green-50",
    accentBorder: "border-emerald-200",
    iconColour: "text-emerald-600",
    tagColour: "bg-emerald-100 text-emerald-700",
    subValues: ["Dignity and Respect", "Transparency", "Trustworthiness", "Justice and Fairness"],
    desc: "Guided by transparency, dignity, and the courage to always do what is right.",
  },
];

const associations = [
  { name: "ISASA", image: "/images/assoc/isasa.jpg", full: "Independent Schools Assoc. of SA" },
  { name: "IQAA", image: "/images/assoc/iqaa.jpg", full: "Independent Quality Assurance Agency" },
  { name: "Eco Schools", image: "/images/assoc/echo school.jpg", full: "WESSA Eco-Schools" },
  { name: "MySchool", image: "/images/assoc/my school.jpg", full: "MySchool MyVillage MyPlanet" },
  { name: "WESSA", image: "/images/assoc/wessa.jpg", full: "Wildlife & Environment Society of SA" },
];

const eventTypeColours: Record<string, string> = {
  Academic: "bg-brand-green text-white",
  Sports: "bg-brand-gold text-white",
  Community: "bg-purple-600 text-white",
  Newsletter: "bg-brand-green text-white",
  Culture: "bg-rose-500 text-white",
};




const galleryImages = [
  { src: "/images/Gallery/Academics/IMG_5302 (2).jpg", alt: "Classroom learning", tall: true },
  { src: "/images/Gallery/Sport/IMG_5742.jpg", alt: "Sports day", tall: false },
  { src: "/images/Gallery/Culture/IMG_6444.jpg", alt: "Cultural activities", tall: false },
  { src: "/images/Gallery/Pre School/IMG_9293.JPG", alt: "Pre-school fun", tall: true },
  { src: "/images/Gallery/Sport/IMG_8757.JPG", alt: "Athletics", tall: false },
  { src: "/images/Gallery/Academics/IMG_5317.jpg", alt: "Academic excellence", tall: false },
];

const testimonials = [
  {
    quote: "Riverview has been a transformational experience for my daughter. The teachers genuinely care, and the school's values are visible in everything they do.",
    name: "Mrs. S. Fourie",
    role: "Parent — Grade 4",
    initials: "SF",
  },
  {
    quote: "The small class sizes meant my son got the individual attention he needed to truly thrive academically and socially. We couldn't be happier.",
    name: "Mr. T. Van der Berg",
    role: "Parent — Grade 6",
    initials: "TV",
  },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const supabase = await createServerSupabase();

  const { data: latestNewsData } = await supabase
    .from('newsletters')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false })
    .limit(2);

  const dynamicLatestNews = (latestNewsData || []).map((nl: any) => ({
    category: "Newsletter",
    term: nl.term || '',
    issue: nl.issue_number || '',
    date: new Date(nl.publish_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }),
    title: nl.title || 'Newsletter',
    highlights: Array.isArray(nl.highlights) ? nl.highlights.slice(0, 3) : [],
    excerpt: nl.excerpt || '',
    href: `/news/${nl.slug}`,
    image: (!nl.hero_image || nl.hero_image.includes('placeholder')) ? "/images/banner.jpg" : nl.hero_image,
  }));

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. At-a-glance stats bar ────────────────────────────────────── */}
      <div className="bg-brand-green text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { label: "Founded", value: "1996" },
              { label: "Students", value: "280+" },
              { label: "Class Size", value: "≤ 25" },
              { label: "Grades", value: "000 – 7" },
            ].map((s) => (
              <div key={s.label} className="py-8 px-8 text-center">
                <p className="text-3xl font-bold mb-1 text-brand-gold">{s.value}</p>
                <p className="text-xs uppercase tracking-widest opacity-60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Philosophy ───────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="telemetry-monospace text-brand-green">OUR PHILOSOPHY</div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                Shaping Hearts, <br />
                <span className="drama-text text-brand-gold">MIND & FUTURE.</span>
              </h2>
              <div className="space-y-4">
                <p className="text-brand-green/70 leading-relaxed text-lg">
                  At Riverview Preparatory School, we believe that education is about more than just academic marks; 
                  it&apos;s about nurturing the whole child. Nestled in the heart of the Lowveld, our school provides 
                  a sanctuary where your children can discover their passions, build lasting friendships, 
                  and develop the character they need to lead in an ever-changing world.
                </p>
              </div>
            </div>
            <div className="relative">
              <HexagonShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Headmaster Welcome ───────────────────────────────────────── */}
      <section className="py-28 bg-brand-cream overflow-hidden">
        <div className="container mx-auto px-6 border-y border-brand-green/5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-2 relative">
              <div className="relative aspect-[4/5] w-full max-w-sm mx-auto group">
                <div className="relative w-full h-full rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden shadow-2xl border-4 border-white">
                  <Image
                    src="/images/headmaster.jpg"
                    alt="Mr. Murray Johnson - Headmaster"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-8">
              <div className="telemetry-monospace text-brand-green">A WORD FROM THE HEADMASTER</div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Shaping tomorrow&apos;s <span className="drama-text text-brand-gold">LEADERS.</span>
              </h2>
              <div className="space-y-6 text-brand-green/70 leading-loose text-[1.05rem]">
                <p>
                  Welcome to Riverview Preparatory School — a place where every child is seen, heard, and celebrated. 
                  Nestled in the breath-taking heart of the Lowveld, near Malelane, our school is as deeply rooted 
                  in this majestic landscape as we are in our commitment to nurturing young minds. Here, the 
                  expansive beauty of the South African bushveld provides a remarkable canvas for children 
                  to discover their unique potential.
                </p>
                <p>
                  At Riverview, we believe that true education transcends academics; it is the careful cultivation 
                  of the whole child. Guided by our foundational values of Love, Faith, and Integrity, we provide 
                  a sanctuary where character is forged and curiosity is kindled. Our dedicated staff ensures 
                  that every pupil is embraced within a warm, community-focused environment that champions 
                  emotional well-being alongside intellectual growth.
                </p>
                <p>
                  From the joyful, discovery-filled early steps of Grade 000 to the confident, compassionate 
                  leadership of our Grade 7 pupils, Riverview offers a seamless journey through the most formative 
                  years. We watch with immense pride as our learners evolve into young leaders, equipped 
                  not only with knowledge, but with the moral compass and resilience required to shape a brighter future.
                </p>
              </div>
              <div className="pt-4 border-t border-brand-green/10">
                <p className="font-serif italic text-2xl text-brand-green/60">Mr. Murray Johnson</p>
                <p className="text-xs uppercase tracking-widest opacity-40 mt-1">Headmaster, Riverview Preparatory School</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Upcoming Events (from calendar_entries this month) ────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <div className="telemetry-monospace text-brand-green mb-4">SCHOOL PULSE</div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Upcoming <span className="drama-text text-brand-gold">Events.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2 relative">
              <EventPosterSlider />
            </div>

            <div className="lg:col-span-3">
              <PublicCalendar />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. School Values ────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-green text-white overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="telemetry-monospace text-brand-gold mb-4">OUR CHARTER</div>
            <h2 className="text-3xl md:text-6xl font-bold mb-6">
              Built on <span className="drama-text text-brand-gold">VALUES.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {coreValues.map((val, idx) => (
              <div
                key={val.name}
                className="relative group flex flex-col items-center text-center px-6"
              >
                <div className={`relative w-24 h-24 mb-10 flex items-center justify-center rounded-full bg-white shadow-2xl border border-brand-green/5 group-hover:-translate-y-3 transition-transform duration-500 overflow-hidden`}>
                   <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${val.colour}`} />
                   <div className={`${val.iconColour}`}>{val.icon}</div>
                </div>
                <h3 className="text-4xl font-bold mb-6 tracking-tight relative">
                  {val.name}
                </h3>
                <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xs">
                  {val.desc}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-auto">
                  {val.subValues.map((sv) => (
                    <span key={sv} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                      {sv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Latest News ──────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-cream border-y border-brand-green/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <div className="telemetry-monospace text-brand-green mb-4">THE CHRONICLE</div>
              <h2 className="text-3xl md:text-5xl font-bold text-brand-green">
                Latest <span className="drama-text text-brand-gold">News.</span>
              </h2>
            </div>
            <Link href="/news" className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-brand-green transition-colors flex items-center gap-2">
              All News &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dynamicLatestNews.map((news, i) => (
              <Link href={news.href} key={i} className="group block h-full">
                <article className="h-full rounded-[2rem] overflow-hidden border border-brand-green/8 hover:border-brand-gold/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white flex flex-col">
                  <div className="relative h-64 w-full overflow-hidden flex-shrink-0">
                    <FallbackImage
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-green">{news.category}</span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold">
                        {news.date}
                      </span>
                      {news.issue && <span className="text-[10px] text-brand-green/40 font-bold uppercase tracking-widest">· {news.issue}</span>}
                    </div>
                    <h3 className="font-bold text-2xl leading-snug mb-4 group-hover:text-brand-green transition-colors flex-none line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-sm text-brand-green/60 leading-relaxed mb-6 line-clamp-3 flex-1">
                      {news.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-green/5">
                      <div className="flex flex-wrap gap-2">
                        {news.highlights.map((h: string) => (
                          <span
                            key={h}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-brand-green/5 text-brand-green"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                      <div className="w-10 h-10 rounded-full border border-brand-green/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:border-brand-gold group-hover:text-white transition-all text-brand-green flex-shrink-0">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Testimonials ─────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-green text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="telemetry-monospace text-brand-gold mb-4">COMMUNITY VOICES</div>
            <h2 className="text-3xl md:text-5xl font-bold">What <span className="drama-text text-brand-gold">Parents</span> Say.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
             {testimonials.map((test, i) => (
               <div key={i} className="relative bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-brand-gold/30 transition-colors">
                 <div className="text-brand-gold text-6xl font-serif absolute top-4 left-4 opacity-30">&quot;</div>
                 <p className="text-lg md:text-xl leading-relaxed font-light mb-8 relative z-10 pt-6 px-2">{test.quote}</p>
                 <div className="flex items-center gap-4 px-2">
                   <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold">
                     {test.initials}
                   </div>
                   <div>
                     <p className="font-bold">{test.name}</p>
                     <p className="text-sm opacity-60">{test.role}</p>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>



      {/* ── 12. Associations ───────────────────────────── */}
      <section className="py-24 border-y border-brand-green/5 bg-white">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-brand-green/30 mb-12 font-bold">
            Proud Member of
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {associations.map((assoc) => (
              <div key={assoc.name} className="flex flex-col items-center gap-2 group">
                <div className="w-28 h-28 rounded-2xl border border-white/10 bg-white items-center justify-center group-hover:border-brand-gold/40 transition-colors duration-400 overflow-hidden p-4 flex shadow-sm">
                  <Image
                    src={assoc.image}
                    alt={assoc.name}
                    width={110}
                    height={110}
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] text-brand-green/40 text-center max-w-[100px] leading-snug">
                  {assoc.full}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
