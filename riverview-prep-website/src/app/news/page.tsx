import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Trophy, Users, Calendar } from "lucide-react";
import NewsletterHeader from "@/components/NewsletterHeader";
import SecondaryBanner from "@/components/SecondaryBanner";
import type { Metadata } from "next";

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

const articles = [
  {
    slug: "12-march-2026",
    term: "Term 1",
    issue: "Issue 05",
    date: "12 March 2026",
    isoDate: "2026-03-12",
    category: "Newsletter",
    highlights: ["Grade 7 Mentor Leads", "Athletics Victories", "Swimming Silver"],
    title: "Oliver with a Twist · Swimming Medals · Sports Fixtures",
    subtitle:
      "Our Grade 4–7 learners prepare for an extraordinary theatrical production, while Usentele Sibiya brings home silver from the SSA Level 1 Swimming Championships.",
    excerpt:
      "This edition of the Riverview Reporter spotlights our upcoming school play \"Oliver with a Twist\", celebrates Usentele Sibiya's swimming achievements, updates parents on upcoming sports fixtures, and shares important date reminders including Photo Day and Parent Interviews.",
    image: "/images/oliver-with-a-twist.jpg",
    imageAlt: "Oliver with a Twist theatrical poster",
    tags: ["Sports", "Culture", "Academic"],
    featured: true,
    readTime: "4 min read",
  },
  {
    slug: "26-february-2026",
    term: "Term 1",
    issue: "Issue 04",
    date: "26 February 2026",
    isoDate: "2026-02-26",
    category: "Newsletter",
    highlights: ["Book Week", "Golf Day Prep", "Sports Wins"],
    title: "Golf Day Fundraiser · Book Week · Athletics Stars",
    subtitle:
      "Vutomi Mthethwa competes at the Mpumalanga Schools Athletics Championship, while the school celebrates a vibrant Book Week and announces a major Golf Day fundraiser.",
    excerpt:
      "The February 26 Riverview Reporter celebrates relay gala victories at Flamboyant, announces the School Golf Day on 25 July at Malelane Golf Club, recaps Book Week activities, and shares highlights from Grade 6 Afrikaans speeches and Grade 7 Mentor inductions.",
    image:
      "https://images.unsplash.com/photo-1551958219-acbc630e2914?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Athletics competition",
    tags: ["Sports", "Academic", "Community"],
    featured: false,
    readTime: "5 min read",
  },
];

export default function NewsPage() {
  const [featured, ...rest] = articles;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <SecondaryBanner 
        title="Weekly Newsletters" 
        subtitle="The latest from campus community"
      />

      {/* ── Featured Article ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="telemetry-monospace text-brand-green mb-10">
            LATEST EDITION
          </div>

          <Link href={`/news/${featured.slug}`} className="group block">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-[3rem] overflow-hidden border border-brand-green/8 hover:shadow-2xl transition-all duration-700 hover:-translate-y-1">
              {/* Header Banner */}
              <div className="lg:col-span-3 h-full">
                <NewsletterHeader
                  issue={featured.issue}
                  term={featured.term}
                  date={featured.date}
                  category={featured.category}
                  title={featured.title}
                  highlights={featured.highlights}
                />
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
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${categoryColours[tag]}`}
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

      {/* ── Previous Editions ─────────────────────────────────────────────── */}
      <section className="pb-28">
        <div className="container mx-auto px-6">
          <div className="telemetry-monospace text-brand-green mb-10">
            PREVIOUS EDITIONS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group block"
              >
                <article className="h-full rounded-[2rem] overflow-hidden border border-brand-green/8 hover:border-brand-gold/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white flex flex-col">
                  {/* Newsletter Header Banner */}
                  <div className="flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-700 origin-top">
                    <NewsletterHeader
                      issue={article.issue}
                      date={article.date}
                      category={article.category}
                      title={article.title}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-3">
                      {article.date} · {article.readTime}
                    </p>
                    <h3 className="font-bold text-xl leading-snug mb-3 group-hover:text-brand-green transition-colors flex-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-brand-green/60 leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${categoryColours[tag]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-widest group-hover:text-brand-gold transition-colors mt-auto">
                      Read Edition{" "}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {/* Subscribe CTA Card */}
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

      <Footer />
    </main>
  );
}
