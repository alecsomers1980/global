"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HexagonShowcase from "@/components/HexagonShowcase";
import NewsletterHeader from "@/components/NewsletterHeader";
import EventPosterSlider from "@/components/EventPosterSlider";
import { createClient } from "@/lib/supabase-client";
import {
  Calendar,
  Shield,
  Heart,
  Star,
  MapPin,
  Loader2,
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

const latestNews = [
  {
    category: "Newsletter",
    term: "Term 1",
    issue: "Issue 05",
    date: "12 Mar 2026",
    title: "Oliver with a Twist · Swimming Silver Medals · Term Dates",
    highlights: ["Grade 4–7 Theatre", "Swimming Medals", "Term 2 Dates"],
    excerpt: "Our Grade 4–7 learners prepare for an extraordinary theatrical production while Usentele Sibiya brings home two silver medals.",
    href: "/news/12-march-2026",
  },
  {
    category: "Newsletter",
    term: "Term 1",
    issue: "Issue 04",
    date: "26 Feb 2026",
    title: "Golf Day Announced · Book Week Highlights · Athletics Stars",
    highlights: ["Golf Day July 25", "Athletics Stars", "Book Week"],
    excerpt: "Vutomi Mthethwa qualifies for the Mpumalanga Schools Athletics Championship, and school Golf Day is confirmed.",
    href: "/news/26-february-2026",
  },
];


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

interface CalendarEventItem {
  id: string;
  day: string;
  dateStr: string;
  month: string;
  title: string;
  type: string;
  location: string;
}

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [currentMonthLabel, setCurrentMonthLabel] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  async function fetchCalendarEvents() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setCurrentMonthLabel(now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

      const { data } = await supabase
        .from('calendar_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (data) {
        const mapped = data.map((entry: any) => {
          const dateObj = new Date(entry.date + 'T00:00:00');
          return {
            id: entry.id,
            day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            dateStr: dateObj.getDate().toString(),
            month: dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            title: entry.title,
            type: entry.type || 'Academic',
            location: entry.location || 'Campus',
          };
        });
        setUpcomingEvents(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    } finally {
      setLoadingEvents(false);
    }
  }

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
              <div className="space-y-5 text-brand-green/70 leading-loose text-[1.05rem]">
                <p>
                  Welcome to Riverview Preparatory School — a place where every child is seen, heard, and
                  celebrated. 
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
            {currentMonthLabel && (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-green/40">
                <Calendar className="w-4 h-4 text-brand-gold" />
                {currentMonthLabel}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2 relative">
              <EventPosterSlider />
            </div>

            <div className="lg:col-span-3 space-y-4">
              {loadingEvents ? (
                <div className="flex items-center justify-center p-20 opacity-20">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => (
                  <div
                    key={i}
                    className="group flex gap-6 p-6 rounded-[2rem] border border-brand-green/5 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-500"
                  >
                    <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-brand-green text-white rounded-2xl py-3 gap-1 shadow-lg group-hover:scale-105 transition-transform">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{event.day}</span>
                      <span className="text-xl font-bold leading-none">{event.dateStr}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{event.month}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${eventTypeColours[event.type] || 'bg-brand-green text-white'}`}>
                          {event.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl leading-snug mb-1 group-hover:text-brand-green transition-colors">
                        {event.title}
                      </h3>
                      <p className="flex items-center gap-1.5 text-xs opacity-50 font-bold">
                        <MapPin className="w-3 h-3 text-brand-gold" /> {event.location}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-brand-cream/50 rounded-3xl border-2 border-dashed border-brand-green/5">
                  <Calendar className="w-10 h-10 text-brand-green/10 mx-auto mb-3" />
                  <p className="text-sm font-bold text-brand-green/40">No events scheduled for {currentMonthLabel}.</p>
                  <p className="text-xs text-brand-green/25 mt-1">Add entries via the admin calendar.</p>
                </div>
              )}
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
