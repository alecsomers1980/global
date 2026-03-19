import React from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HexagonShowcase from "@/components/HexagonShowcase";
import NewsletterHeader from "@/components/NewsletterHeader";
import EventPosterSlider from "@/components/EventPosterSlider";
import {
  Calendar,
  ArrowRight,
  Shield,
  Heart,
  Star,
  Quote,
  Camera,
  Phone,
  MapPin,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const upcomingEvents = [
  { date: "14 Mar", day: "FRI", title: "Grade 6 & 7 Camp", type: "Academic", location: "Kruger National Park" },
  { date: "24 Mar", day: "MON", title: "2nd Term Starts", type: "Academic", location: "Campus" },
  { date: "02 Apr", day: "WED", title: "U13 Rugby vs Penryn", type: "Sports", location: "Home Fields" },
  { date: "28 Apr", day: "MON", title: "Parent-Teacher Evening", type: "Community", location: "Main Hall" },
  { date: "05 May", day: "MON", title: "U11 Cricket vs Uplands", type: "Sports", location: "White River" },
];

const coreValues = [
  {
    name: "Love",
    icon: <Heart className="w-8 h-8" />,
    colour: "from-rose-50 to-red-50",
    accentBorder: "border-rose-200",
    iconColour: "text-rose-500",
    tagColour: "bg-rose-100 text-rose-700",
    subValues: ["Self-worth and Growth", "Motivation", "Humour"],
  },
  {
    name: "Faith",
    icon: <Star className="w-8 h-8" />,
    colour: "from-amber-50 to-yellow-50",
    accentBorder: "border-amber-200",
    iconColour: "text-amber-500",
    tagColour: "bg-amber-100 text-amber-700",
    subValues: ["Consistency", "Loyalty", "Hard Work"],
  },
  {
    name: "Integrity",
    icon: <Shield className="w-8 h-8" />,
    colour: "from-emerald-50 to-green-50",
    accentBorder: "border-emerald-200",
    iconColour: "text-emerald-600",
    tagColour: "bg-emerald-100 text-emerald-700",
    subValues: ["Dignity and Respect", "Transparency", "Trustworthiness", "Justice and Fairness"],
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
  {
    category: "Newsletter",
    term: "Term 1",
    issue: "Issue 03",
    date: "12 Feb 2026",
    title: "Valentine's Cake Sale · Tennis Results · Art Exhibition",
    highlights: ["Cake Sale Success", "Tennis Win vs Penryn", "Art Showcase"],
    excerpt: "The school spirit was high during our annual Valentine's bake sale, and our tennis teams showed great form on the courts.",
    href: "/news/12-february-2026",
  },
  {
    category: "Newsletter",
    term: "Term 1",
    issue: "Issue 02",
    date: "29 Jan 2026",
    title: "Welcome Back · New Grade 1s · Swimming Trials",
    highlights: ["Grade 1 Welcome", "Swimming Gala Prep", "Extramurals"],
    excerpt: "We welcome all our learners back for the 2026 academic year, with a special greeting to our new Grade 1 classes.",
    href: "/news/29-january-2026",
  },
];


const galleryImages = [
  { src: "/images/Gallery/Academics/IMG_5302 (2).jpg", alt: "Classroom learning", tall: true },
  { src: "/images/Gallery/Sport/IMG_5742.jpg", alt: "Sports day", tall: false },
  { src: "/images/Gallery/Culture/IMG_6444.jpg", alt: "Cultural activities", tall: false },
  { src: "/images/Gallery/Pre School/IMG_9293.JPG", alt: "Pre-school fun", tall: true },
  { src: "/images/Gallery/Sport/IMG_8757.JPG", alt: "Athletics", tall: false },
  { src: "/images/Gallery/Academics/IMG_5317.jpg", alt: "Academic excellence", tall: false },
  { src: "/images/Gallery/Academics/IMG_5264.jpg", alt: "Science lab", tall: true },
  { src: "/images/Gallery/Sport/IMG_5711.jpg", alt: "Athletics track", tall: false },
  { src: "/images/Gallery/Sport/IMG_6544.jpg", alt: "Swimming prep", tall: false },
];

const testimonials = [
  {
    quote: "Riverview has been a transformational experience for my daughter. The teachers genuinely care, and the school\'s values are visible in everything they do.",
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
  {
    quote: "From Cubs all the way to Grade 7, the level of care and dedication from every staff member has been exceptional. Riverview is truly a family.",
    name: "Dr. A. Pretorius",
    role: "Parent — Cubs & Grade 2",
    initials: "AP",
  },
  {
    quote: "The balance between academics, sport, and values education is exactly what we were looking for. Our children have grown in confidence every year.",
    name: "Mrs. L. Nkosi",
    role: "Parent — Grade 3 & 5",
    initials: "LN",
  },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Home() {
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
                <p className="text-brand-green/70 leading-relaxed text-lg">
                  From our state-of-the-art classrooms to our vibrant sports fields, every corner of Riverview 
                  is designed to inspire curiosity and excellence. We invite you to become part of our family, 
                  where every child&apos;s potential is recognized and celebrated.
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
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            {/* Premium Image Frame */}
            <div className="lg:col-span-2 relative">
              <div className="relative aspect-[4/5] w-full max-w-sm mx-auto group">
                {/* Background decorative square */}
                <div className="absolute -top-6 -right-6 w-full h-full border border-brand-gold/20 rounded-3xl -z-10 transition-transform duration-700 group-hover:translate-x-3 group-hover:-translate-y-3" />
                
                {/* Brand colored accent block */}
                <div className="absolute -bottom-8 -left-8 w-1/2 h-1/2 bg-brand-green/5 rounded-3xl -z-10 blur-2xl" />
                
                {/* Main image container */}
                <div className="relative w-full h-full rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden shadow-2xl border-4 border-white">
                  <Image
                    src="/images/headmaster.jpg"
                    alt="Mr. Murray Johnson - Headmaster"
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-1000"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-green/40 to-transparent opacity-60" />
                </div>
              </div>
            </div>

            {/* Message right */}
            <div className="lg:col-span-3 space-y-8">
              <div className="telemetry-monospace text-brand-green">A WORD FROM THE HEADMASTER</div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Shaping tomorrow&apos;s <span className="drama-text text-brand-gold">LEADERS.</span>
              </h2>
              <div className="space-y-5 text-brand-green/70 leading-loose text-[1.05rem]">
                <p>
                  Welcome to Riverview Preparatory School — a place where every child is seen, heard, and
                  celebrated. Since our founding in 1996, we have been dedicated to creating an environment
                  where academic excellence and holistic development walk hand in hand.
                </p>
                <p>
                  Our approach goes beyond the curriculum. We nurture children who are confident,
                  compassionate, and curious — equipping them with the cognitive, physical, emotional, and
                  social skills they need for a lifetime of learning and leadership.
                </p>
                <p>
                  I warmly invite you to visit our campus, meet our dedicated staff, and experience the
                  Riverview difference firsthand. On behalf of our entire school family — welcome.
                </p>
              </div>
              {/* Signature */}
              <div className="pt-4 border-t border-brand-green/10">
                <p className="font-serif italic text-2xl text-brand-green/60">Mr. Murray Johnson</p>
                <p className="text-xs uppercase tracking-widest opacity-40 mt-1">Headmaster, Riverview Preparatory School</p>
              </div>
              <a
                href="/about"
                className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand-green hover:text-brand-gold transition-colors group"
              >
                Meet Our Team
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Upcoming Events ──────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <div className="telemetry-monospace text-brand-green mb-4">SCHOOL PULSE</div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Upcoming <span className="drama-text text-brand-gold">Events.</span>
              </h2>
            </div>
            <a
              href="/calendar"
              className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand-green hover:text-brand-gold transition-colors group"
            >
              Full Calendar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left: Poster Showcase */}
            <div className="lg:col-span-2 relative">
              <div className="absolute -top-6 -left-6 w-full h-full border border-brand-gold/20 rounded-tr-[5rem] rounded-bl-[5rem] -z-10 transition-transform duration-700 group-hover:translate-x-2 group-hover:-translate-y-2" />
              <EventPosterSlider />
            </div>

            {/* Right: Event List */}
            <div className="lg:col-span-3 space-y-4">
              {upcomingEvents.map((event, i) => (
                <div
                  key={i}
                  className="group flex gap-6 p-6 rounded-[2rem] border border-brand-green/5 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-500"
                >
                  {/* Date pill */}
                  <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-brand-green text-white rounded-2xl py-3 gap-1 shadow-lg group-hover:scale-105 transition-transform">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{event.day}</span>
                    <span className="text-xl font-bold leading-none">{event.date.split(" ")[0]}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{event.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${eventTypeColours[event.type]}`}>
                        {event.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl leading-snug mb-1 group-hover:text-brand-green transition-colors">
                      {event.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs opacity-50">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </p>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-8">
                <a
                  href="/calendar"
                  className="inline-flex items-center gap-4 px-10 py-5 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green/90 transition-all hover:shadow-lg group"
                >
                  Explore All Events
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. School Values ────────────────────────────────────────────── */}
      <section className="py-28 bg-brand-green text-white overflow-hidden relative">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="telemetry-monospace text-brand-gold mb-4">OUR CHARTER</div>
            <h2 className="text-3xl md:text-6xl font-bold mb-6">
              Built on <span className="drama-text text-brand-gold">VALUES.</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed">
              Three pillars. Ten commitments. One community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Center Line Decorative */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent hidden lg:block -translate-y-1/2" />
            
            {coreValues.map((val, idx) => (
              <div
                key={val.name}
                className="relative group flex flex-col items-center text-center px-6"
              >
                {/* Large Background Letter / Number */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[12rem] font-black text-white/5 pointer-events-none select-none group-hover:text-brand-gold/5 transition-colors duration-700">
                  {idx + 1}
                </div>

                {/* Floating Icon Sphere */}
                <div className={`relative w-24 h-24 mb-10 flex items-center justify-center rounded-full bg-white shadow-2xl border border-brand-green/5 group-hover:-translate-y-3 transition-transform duration-500 overflow-hidden`}>
                   <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${val.colour}`} />
                   <div className={`${val.iconColour}`}>{val.icon}</div>
                </div>

                {/* Content */}
                <h3 className="text-4xl font-bold mb-6 tracking-tight relative">
                  {val.name}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-gold rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                </h3>
                
                <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xs">
                  {idx === 0 && "Nurturing an environment of unconditional acceptance, warmth, and mutual respect."}
                  {idx === 1 && "Staying true to our heritage through unwavering commitment and spiritual growth."}
                  {idx === 2 && "Guided by transparency, dignity, and the courage to always do what is right."}
                </p>

                {/* Sub-values floating pill tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-auto">
                  {val.subValues.map((sv) => (
                    <span key={sv} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-brand-gold/30 hover:bg-brand-gold/10 transition-all cursor-default">
                      {sv}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 8. Latest News Feed ─────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <div className="telemetry-monospace text-brand-green mb-4">LATEST FROM CAMPUS</div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Weekly <span className="drama-text text-brand-gold">Newsletters.</span>
              </h2>
            </div>
            <a href="/news" className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand-green hover:text-brand-gold transition-colors group">
              All News <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured (Latest) Newsletter */}
            {latestNews.length > 0 && (
              <a href={latestNews[0].href} className="lg:col-span-2 group block rounded-[2rem] overflow-hidden border border-brand-green/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white flex flex-col h-full">
                <div className="flex-grow h-full group-hover:scale-[1.01] transition-transform duration-700 origin-top">
                  <NewsletterHeader
                    issue={latestNews[0].issue}
                    term={latestNews[0].term}
                    date={latestNews[0].date}
                    category={latestNews[0].category}
                    title={latestNews[0].title}
                    highlights={latestNews[0].highlights}
                    excerpt={latestNews[0].excerpt}
                    fullHeight
                  />
                </div>
              </a>
            )}

            {/* Other Newsletters Stacked */}
            <div className="space-y-4 flex flex-col justify-between">
              {latestNews.slice(1).map((article, i) => (
                <a key={i} href={article.href} className="group block rounded-[1.5rem] overflow-hidden border border-brand-green/5 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-white flex flex-col">
                  <div className="group-hover:scale-[1.01] transition-transform duration-700 origin-top">
                    <NewsletterHeader
                      issue={article.issue}
                      term={article.term}
                      date={article.date}
                      category={article.category}
                      title={article.title}
                      compact
                    />
                  </div>
                  <div className="p-4 border-t border-brand-green/5 flex-grow flex items-center justify-between bg-brand-cream/30">
                    <div className="flex items-center gap-1.5 text-brand-green font-bold text-[9px] uppercase tracking-widest group-hover:text-brand-gold transition-colors">
                      Read More <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Photo Gallery Preview ────────────────────────────────────── */}
      <section className="py-28 bg-brand-cream overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <div className="telemetry-monospace text-brand-green mb-4">LIFE AT RIVERVIEW</div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Campus <span className="drama-text text-brand-gold">Gallery.</span>
              </h2>
            </div>
            <a href="/gallery" className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand-green hover:text-brand-gold transition-colors group">
              <Camera className="w-4 h-4" /> Full Gallery <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          {/* Masonry Grid */}
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="relative mb-8 break-inside-avoid group">
                {/* Decorative Frame Behind */}
                <div className="absolute -top-3 -right-3 w-full h-full border border-brand-gold/20 rounded-2xl -z-10 transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
                
                {/* Accent Glow */}
                <div className="absolute -bottom-4 -left-4 w-1/2 h-1/2 bg-brand-green/5 rounded-2xl -z-10 blur-xl" />

                {/* Main Image Container */}
                <div className={`relative overflow-hidden shadow-xl border-2 border-white transition-all duration-700 cursor-pointer
                  ${img.tall ? "h-80" : "h-52"}
                  ${i % 2 === 0 ? "rounded-tr-[3rem] rounded-bl-[3rem]" : "rounded-tl-[3rem] rounded-br-[3rem]"}
                  group-hover:scale-[1.03] group-hover:shadow-2xl`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover object-top group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-brand-green/0 group-hover:bg-brand-green/40 transition-all duration-500 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Testimonials Carousel ───────────────────────────────────── */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="telemetry-monospace text-brand-green mb-4">PARENT VOICES</div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Trusted by <span className="drama-text text-brand-gold">FAMILIES.</span>
            </h2>
          </div>
          {/* Scrolling ticker-style row of cards */}
          <div className="relative">
            <div
              className="flex gap-8 animate-scroll"
              style={{
                width: `max-content`,
              }}
            >
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={i}
                  className="w-[380px] flex-shrink-0 p-10 rounded-[2rem] border border-brand-green/8 bg-brand-cream hover:border-brand-gold/30 hover:shadow-xl transition-all duration-500"
                >
                  <Quote className="w-8 h-8 text-brand-gold/40 mb-6" />
                  <p className="text-brand-green/80 leading-relaxed text-[1rem] mb-8 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-brand-green/10">
                    <div className="w-12 h-12 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-brand-green">{t.name}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-40">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. CTA Band ────────────────────────────────────────────────── */}
      <section className="relative py-28 bg-brand-green overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-white">
              <div className="telemetry-monospace text-brand-gold">VISIT OUR CAMPUS</div>
              <h2 className="text-4xl md:text-6xl font-bold leading-[0.95]">
                Book a School <span className="drama-text text-brand-gold">TOUR.</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-lg">
                Experience the Riverview difference firsthand. Meet our teachers, see our facilities,
                and discover why families choose us year after year.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="/admissions"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-brand-gold/90 transition-colors"
                >
                  Book a Tour <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/admissions"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-colors"
                >
                  Download Prospectus
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: <Phone className="w-5 h-5" />, label: "Call Us", value: "+27 (0) 13 790 0000" },
                { icon: <MapPin className="w-5 h-5" />, label: "Find Us", value: "Malelane, Mpumalanga, South Africa" },
                { icon: <Calendar className="w-5 h-5" />, label: "Open Days", value: "Term 1 & 3 — Contact us to book" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-all duration-400">
                  <div className="w-12 h-12 bg-brand-gold/20 rounded-2xl flex items-center justify-center text-brand-gold flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">{item.label}</p>
                    <p className="text-white font-semibold text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Associations / Accreditations ───────────────────────────── */}
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

      {/* ── 9. Newsletter / CTA ─────────────────────────────────────────── */}
      <section className="py-28 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Stay <span className="drama-text text-brand-gold">Connected.</span>
          </h2>
          <p className="text-brand-green/60 mb-10 text-lg">
            Receive the weekly <em>School Pulse</em> newsletter directly in your inbox.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="Parent Email Address"
              className="flex-1 px-8 py-4 rounded-full border border-brand-green/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-brand-cream"
            />
            <button className="magnetic-button whitespace-nowrap">Subscribe to Pulse</button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
