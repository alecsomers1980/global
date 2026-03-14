import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ArrowRight,
  Users,
  Star,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Oliver with a Twist — School Play 2026 | Riverview Preparatory School",
  description:
    "An unforgettable theatrical evening at Riverview Prep. \"Oliver with a Twist\" runs 24–26 March 2026 in the Riverview Prep School Hall, Malelane. Dinner Theatre (R280) and General Seating (R80) available.",
  keywords: [
    "Oliver with a Twist Riverview",
    "school play Malelane 2026",
    "Riverview Prep drama",
    "school theatre Mpumalanga",
    "Oliver Twist school production",
  ],
  openGraph: {
    title: "Oliver with a Twist — Riverview Prep School Play 2026",
    description:
      "Join us for \"Oliver with a Twist\" at Riverview Preparatory School. 24–26 March 2026. Dinner Theatre & General Seating available.",
    type: "website",
    images: [{ url: "/images/oliver-with-a-twist.png" }],
  },
};

const ticketOptions = [
  {
    type: "Dinner Theatre",
    price: "R280",
    priceLabel: "per person",
    dates: "24 & 25 March 2026",
    includes: [
      "Full sit-down meal included",
      "Reserved dinner seating",
      "Production programme",
      "Full theatrical performance",
    ],
    highlight: true,
    badge: "Popular",
  },
  {
    type: "General Seating",
    price: "R80",
    priceLabel: "per person",
    dates: "26 March 2026",
    includes: [
      "General admission seating",
      "Tuckshop refreshments available",
      "Production programme",
      "Full theatrical performance",
    ],
    highlight: false,
    badge: null,
  },
];

const eventDetails = [
  { icon: <Calendar className="w-5 h-5" />, label: "Dates", value: "24, 25 & 26 March 2026" },
  { icon: <Clock className="w-5 h-5" />, label: "Time", value: "18:00 (Doors open at 17:30)" },
  { icon: <MapPin className="w-5 h-5" />, label: "Venue", value: "Riverview Prep School Hall, Malelane, Mpumalanga" },
  { icon: <Users className="w-5 h-5" />, label: "Performers", value: "Grades 4–7 Learners" },
  { icon: <Ticket className="w-5 h-5" />, label: "Tickets", value: "R80 – R280 per person" },
];

export default function OliverWithATwistPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-48 pb-0 bg-brand-green overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-gold/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 text-white/40 hover:text-brand-gold transition-colors text-xs uppercase tracking-widest font-bold mb-12"
          >
            ← Events Calendar
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end pb-0">
            <div className="space-y-6 pb-20">
              <span className="inline-block px-4 py-1.5 bg-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/30">
                Annual School Production
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Oliver with{" "}
                <span className="drama-text text-brand-gold text-6xl md:text-8xl block">
                  a Twist.
                </span>
              </h1>
              <p className="text-brand-gold/80 font-serif italic text-xl">
                &ldquo;Expect the Unexpected&rdquo;
              </p>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Riverview Preparatory School presents a reimagined retelling of
                the beloved classic — brought to life by the remarkable talent
                of our Grade 4–7 learners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="#tickets"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-brand-gold/90 transition-all hover:shadow-lg"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets
                </a>
                <a
                  href="tel:+27137900000"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call the School
                </a>
              </div>
            </div>

            {/* Poster */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-72 md:w-80 group">
                <div className="absolute -top-4 -right-4 w-full h-full border border-brand-gold/20 rounded-[3rem] -z-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                  <Image
                    src="/images/oliver-with-a-twist.jpg"
                    alt="Oliver with a Twist – School Play Poster"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Event Quick Details ───────────────────────────────────────────── */}
      <section className="bg-brand-gold py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {eventDetails.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="opacity-70">{d.icon}</div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest font-bold opacity-70">
                    {d.label}
                  </div>
                  <div className="font-bold text-sm">{d.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the Production ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="telemetry-monospace text-brand-green">
                ABOUT THE PRODUCTION
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                A Classic Reimagined{" "}
                <span className="drama-text text-brand-gold">
                  for Our Stage.
                </span>
              </h2>
              <div className="space-y-6 text-brand-green/70 leading-relaxed">
                <p>
                  This year&apos;s annual school production, &ldquo;Oliver with a
                  Twist,&rdquo; is a bold and imaginative retelling of Charles
                  Dickens&apos; timeless story — reimagined through the creative
                  lens of Riverview Prep. Our young performers have poured
                  months of dedication into bringing these iconic characters to
                  life.
                </p>
                <p>
                  From Oliver&apos;s humble beginnings to Fagin&apos;s colourful gang,
                  every scene has been crafted with care, humour, and heart.
                  This is not your ordinary school play — expect the
                  unexpected at every turn.
                </p>
                <p>
                  Whether you join us for our exclusive Dinner Theatre evenings
                  on the 24th and 25th of March, or the accessible General
                  Seating on the 26th, you are guaranteed an unforgettable
                  evening of entertainment.
                </p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { label: "Cast Members", value: "60+" },
                  { label: "Weeks of Rehearsal", value: "10" },
                  { label: "Performance Dates", value: "3" },
                  { label: "Ticket Options", value: "2" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 bg-brand-cream rounded-[1.5rem] text-center"
                  >
                    <p className="text-3xl font-bold text-brand-green mb-1">
                      {stat.value}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-green/40 font-bold">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Image */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-full h-full bg-brand-gold/10 rounded-[3rem] -z-10" />
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <Image
                  src="/images/oliver-with-a-twist.jpg"
                  alt="Oliver with a Twist theatre poster"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-brand-gold" />
                    <Star className="w-4 h-4 text-brand-gold" />
                    <Star className="w-4 h-4 text-brand-gold" />
                    <Star className="w-4 h-4 text-brand-gold" />
                    <Star className="w-4 h-4 text-brand-gold" />
                  </div>
                  <p className="text-white font-bold text-lg leading-tight">
                    &ldquo;The Riverview play is always the highlight of our
                    school calendar.&rdquo;
                  </p>
                  <p className="text-white/60 text-sm mt-1">— Riverview Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticket Options ───────────────────────────────────────────────── */}
      <section id="tickets" className="py-24 bg-brand-cream scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="telemetry-monospace text-brand-green mb-4">
              TICKETING
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Choose Your{" "}
              <span className="drama-text text-brand-gold">Experience.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {ticketOptions.map((ticket) => (
              <div
                key={ticket.type}
                className={`relative rounded-[2.5rem] p-10 flex flex-col ${
                  ticket.highlight
                    ? "bg-brand-green text-white shadow-2xl"
                    : "bg-white border border-brand-green/10 shadow-lg"
                }`}
              >
                {ticket.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-5 py-2 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {ticket.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <p
                    className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${
                      ticket.highlight ? "text-brand-gold/80" : "text-brand-green/40"
                    }`}
                  >
                    {ticket.dates}
                  </p>
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      ticket.highlight ? "text-white" : "text-brand-green"
                    }`}
                  >
                    {ticket.type}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-5xl font-black ${
                        ticket.highlight ? "text-brand-gold" : "text-brand-green"
                      }`}
                    >
                      {ticket.price}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        ticket.highlight ? "text-white/60" : "text-brand-green/40"
                      }`}
                    >
                      {ticket.priceLabel}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {ticket.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                          ticket.highlight
                            ? "bg-brand-gold/20"
                            : "bg-brand-green/10"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            ticket.highlight ? "bg-brand-gold" : "bg-brand-green"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm leading-relaxed ${
                          ticket.highlight ? "text-white/80" : "text-brand-green/70"
                        }`}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="tel:+27137900000"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-sm transition-all ${
                    ticket.highlight
                      ? "bg-brand-gold text-white hover:bg-brand-gold/90"
                      : "bg-brand-green text-white hover:bg-brand-green/90"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Contact School to Book
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-brand-green/40 mt-10 max-w-lg mx-auto">
            To book tickets, please contact the school directly. Limited seating
            available — we encourage early booking to avoid disappointment.
          </p>
        </div>
      </section>

      {/* ── Venue & Directions ──────────────────────────────────────────── */}
      <section className="py-24 bg-brand-green text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="telemetry-monospace text-brand-gold">
                VENUE & CONTACT
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Find{" "}
                <span className="drama-text text-brand-gold">Us.</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    label: "Venue",
                    value: "Riverview Prep School Hall, Malelane, Mpumalanga",
                  },
                  {
                    icon: <Calendar className="w-5 h-5" />,
                    label: "Dates",
                    value: "24, 25 & 26 March 2026",
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    label: "Time",
                    value: "18:00 (Doors open 17:30)",
                  },
                  {
                    icon: <Phone className="w-5 h-5" />,
                    label: "Bookings & Enquiries",
                    value: "+27 (0) 13 790 0000",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-5 p-5 bg-white/5 rounded-[1.5rem] border border-white/10"
                  >
                    <div className="w-12 h-12 bg-brand-gold/20 rounded-2xl flex items-center justify-center text-brand-gold flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                        {item.label}
                      </p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-4">
                  Read the Full Newsletter
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Get all the details about this event and more in our latest
                  edition of the Riverview Reporter.
                </p>
                <Link
                  href="/news/12-march-2026"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-brand-gold text-white font-bold rounded-full text-sm hover:bg-brand-gold/90 transition-colors"
                >
                  12 March 2026 Newsletter <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-4">View Full Calendar</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  See all upcoming events, fixtures, and important dates on our
                  interactive school calendar.
                </p>
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white font-bold rounded-full text-sm hover:bg-white/5 transition-colors"
                >
                  Open Calendar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
