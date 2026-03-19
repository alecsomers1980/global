import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Trophy,
  BookOpen,
  Users,
  Heart,
  Clock,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";
import NewsletterHeader from "@/components/NewsletterHeader";
import SecondaryBanner from "@/components/SecondaryBanner";

// ─── NEWSLETTER DATA ──────────────────────────────────────────────────────────

const newsletters: Record<string, NewsletterData> = {
  "12-march-2026": {
    slug: "12-march-2026",
    term: "Term 1",
    issue: "Issue 05",
    date: "12 March 2026",
    isoDate: "2026-03-12",
    highlights: ["Grade 7 Mentor Leads", "Athletics Victories", "Swimming Silver"],
    headline: "Spring into Action: School Play, Swimming Glory & Term Dates",
    subheadline:
      "From silver medals on the national stage to curtain calls awaiting our young actors, Week 9 of Term 1 is one to remember at Riverview Prep.",
    heroImage: "/images/oliver-with-a-twist.png",
    heroImageAlt: "Oliver with a Twist — Riverview Prep School Play Poster",
    seo: {
      title:
        "Riverview Reporter · 12 March 2026 | Riverview Preparatory School",
      description:
        "Read the 12 March 2026 edition of the Riverview Reporter. Featuring the school play 'Oliver with a Twist', Usentele Sibiya's swimming medals, upcoming sports fixtures, Parent Interviews, and Photo Day.",
      keywords: [
        "Riverview Reporter March 2026",
        "Oliver with a Twist Riverview",
        "Riverview Prep newsletter",
        "school play Malelane",
        "Riverview swimming medals",
      ],
    },
    sections: [
      {
        type: "head",
        icon: "heart",
        label: "From the Head's Desk",
        author: "Mr. Murray Johnson — Headmaster",
        content: [
          {
            type: "paragraph",
            text: "As we head into the final stretch of Term 1, there is so much to celebrate across every facet of school life. The energy on our campus is palpable — from the dedicated rehearsals for our school play to the sporting achievements that continue to make us proud.",
          },
          {
            type: "highlight",
            title: "\"Oliver with a Twist\" — Curtain Up Soon",
            text: "I am delighted to confirm that our annual school play, \"Oliver with a Twist,\" will take place from the 24th to the 26th of March. This has been a truly remarkable production process, with our learners demonstrating exceptional creativity, discipline, and teamwork. The theme — Expect the Unexpected — reflects the spirit of every child on that stage. I encourage all families to come and support our young performers.",
          },
          {
            type: "paragraph",
            text: "Winter sport is now well underway with both our netball and rugby teams training hard and performing admirably. To manage travel demands on families, many of our fixtures are scheduled in festival formats. I thank all our coaches and parent supporters for their continued commitment.",
          },
          {
            type: "paragraph",
            text: "Our new school carpark is nearing completion. The updated signage and layout will create a safer and more professional environment for our morning and afternoon arrivals. Thank you for your patience during this improvement phase.",
          },
          {
            type: "paragraph",
            text: "I am also pleased to share that our school is actively participating in the 'Do More' community outreach initiative in partnership with RCL Foods — a wonderful opportunity to instil the value of service and generosity in our learners from an early age.",
          },
          {
            type: "paragraph",
            text: "Finally, I am excited to announce that our Grade 4–7 learners will be attending camp during the first week of next term. This outdoor experience is a cornerstone of holistic education at Riverview, building resilience, independence, and lifelong friendships.",
          },
        ],
      },
      {
        type: "sport",
        icon: "trophy",
        label: "Sport",
        content: [
          {
            type: "achievement",
            title: "Silver Medals at SSA Level 1 Swimming Championships",
            athlete: "Usentele Sibiya",
            detail:
              "We are immensely proud of Usentele Sibiya, who represented Riverview Prep at the SSA (Swimming South Africa) Level 1 Championships and delivered a standout performance. Usentele claimed two silver medals — in the 100m Breaststroke and the 50m Butterfly — a remarkable achievement at national level competition. Well done, Usentele! You make the whole Riverview family proud.",
          },
          {
            type: "paragraph",
            text: "Our netball and rugby squads continue to train with great commitment. Upcoming fixtures include matches against Curro Nelspruit on 18 March and Uplands on 20 March. We wish all our teams the very best and look forward to strong performances in both codes.",
          },
        ],
      },
      {
        type: "dates",
        icon: "calendar",
        label: "Important Dates",
        items: [
          {
            date: "16 March",
            title: "Selati Fun Run — Entry Deadline",
            detail:
              "Final date to submit entries for the Selati Fun Run. Entry fee is R60. All participants should wear their Riverview Greens on the day.",
          },
          {
            date: "16–17 March",
            title: "Parent Interviews — Senior Primary",
            detail:
              "Parent interview slots for Senior Primary (Grades 4–7). Please ensure you have booked your slot with your child's class teacher.",
          },
          {
            date: "18 March",
            title: "Netball & Rugby vs Curro Nelspruit",
            detail: "Away fixture. Please check the school calendar for times.",
          },
          {
            date: "19 March",
            title: "School Photo Day",
            detail:
              "Full school uniform is compulsory. Please ensure your child arrives neat and tidy. Individual and class photos will be taken.",
          },
          {
            date: "20 March",
            title: "Netball & Rugby vs Uplands",
            detail: "Away fixture. Further details will be communicated.",
          },
          {
            date: "24–26 March",
            title: "\"Oliver with a Twist\" School Play",
            detail:
              "24 & 25 March: Dinner Theatre at R280 per person (includes a meal). 26 March: General Seating at R80 per person (refreshments available at the tuckshop). All shows at 18:00 in the Riverview Prep School Hall.",
          },
        ],
      },
      {
        type: "event",
        icon: "users",
        label: "Event Spotlight",
        title: "Oliver with a Twist",
        subtitle: "Expect the Unexpected",
        image: "/images/oliver-with-a-twist.jpg",
        description:
          "Join us for our most ambitious school production yet — a reimagined, Riverview-style retelling of the classic Oliver Twist. Our talented learners have been rehearsing for weeks to bring this captivating Victorian story to life with fresh energy, creativity, and no small amount of surprise.",
        details: [
          { label: "Dates", value: "24, 25 & 26 March 2026" },
          { label: "Time", value: "18:00 (doors open 17:30)" },
          { label: "Venue", value: "Riverview Prep School Hall, Malelane" },
          {
            label: "Dinner Theatre",
            value: "R280 per person (24 & 25 March — includes a meal)",
          },
          {
            label: "General Seating",
            value: "R80 per person (26 March — tuckshop refreshments)",
          },
        ],
        cta: { label: "View Event Details", href: "/events/oliver-with-a-twist" },
      },
    ],
  },

  "26-february-2026": {
    slug: "26-february-2026",
    term: "Term 1",
    issue: "Issue 04",
    date: "26 February 2026",
    isoDate: "2026-02-26",
    highlights: ["Book Week", "Golf Day Prep", "Sports Wins"],
    headline:
      "Relay Gala Victories, Golf Day Announced & Book Week Highlights",
    subheadline:
      "From the Flamboyant Relay Gala podium to astronaut-themed Afrikaans speeches, Term 1 Week 7 was packed with achievement across sport, culture, and academics.",
    heroImage:
      "https://images.unsplash.com/photo-1551958219-acbc630e2914?q=80&w=1600&auto=format&fit=crop",
    heroImageAlt: "Athletics and sport at Riverview Prep",
    seo: {
      title:
        "Riverview Reporter · 26 February 2026 | Riverview Preparatory School",
      description:
        "Read the 26 February 2026 Riverview Reporter newsletter. Flamboyant Relay Gala results, Vutomi Mthethwa at Mpumalanga Athletics Championships, School Golf Day announcement, Book Week recap, Grade 7 Mentor Inductions, and more.",
      keywords: [
        "Riverview Reporter February 2026",
        "Riverview Prep athletics",
        "school golf day Malelane",
        "Book Week primary school",
        "Mpumalanga schools athletics",
      ],
    },
    sections: [
      {
        type: "head",
        icon: "heart",
        label: "From the Head's Desk",
        author: "Mr. Murray Johnson — Headmaster",
        content: [
          {
            type: "paragraph",
            text: "Term 1, Week 7 has been a week of remarkable energy and achievement across our school community. Whether on the athletics track, in the swimming pool, in the classroom, or on our Stage, Riverview learners continue to demonstrate the values of excellence, perseverance, and community spirit that define who we are.",
          },
          {
            type: "paragraph",
            text: "We are busy preparing our athletes for the much-anticipated MJ Zwane Athletics Championships. Training has been intensive, and I have no doubt that our competitors will represent Riverview with distinction.",
          },
          {
            type: "highlight",
            title:
              "Exciting Announcement: School Golf Day — Saturday 25 July 2026",
            text: "I am thrilled to announce our annual School Golf Day, to be held on Saturday 25 July 2026 at the beautiful Malelane Golf Club. This is one of our premier fundraising events and a wonderful opportunity for our school community to come together in a relaxed and enjoyable setting. We invite parents, supporters, and local businesses to get involved. More details regarding sponsorship opportunities and team registrations will be communicated in due course.",
          },
          {
            type: "paragraph",
            text: "Our carpark beautification project is progressing well. The upgrades will significantly improve the safety and flow of our school entrance — a change that will benefit every family at drop-off and collection times.",
          },
        ],
      },
      {
        type: "sport",
        icon: "trophy",
        label: "Sport",
        content: [
          {
            type: "achievement",
            title: "Flamboyant Relay Gala — Podium-Worthy Performance",
            athlete: "Riverview Swim Team",
            detail:
              "Our swimming squad delivered an outstanding performance at the recent Flamboyant Relay Gala, claiming numerous 1st and 2nd place finishes across various relay categories. The team's discipline, cohesion, and competitive spirit were on full display. Congratulations to all who participated and to our coaches for their dedicated preparation.",
          },
          {
            type: "achievement",
            title: "Mpumalanga Schools Athletics Championship",
            athlete: "Vutomi Mthethwa",
            detail:
              "Riverview Prep is immensely proud to announce that Vutomi Mthethwa has qualified to compete at the Mpumalanga Schools Athletics Championship in the Long Jump event. This is a significant accomplishment that reflects Vutomi's exceptional talent and the quality of our athletics programme. We cheer you on, Vutomi!",
          },
        ],
      },
      {
        type: "academic",
        icon: "book",
        label: "Academic & Culture",
        content: [
          {
            type: "paragraph",
            text: "The week of 2–6 March was transformed into a vibrant celebration of literature during our annual Book Week. Learners across all grades participated in a variety of creative activities including designing their own book covers, competing in a school-wide Read-a-thon, and culminating in a wonderful character dress-up day on Friday 6 March.",
          },
          {
            type: "highlight",
            title: "Grade 6 Afrikaans — Speeches in Space",
            text: "In a creative and thoroughly entertaining twist, our Grade 6 Afrikaans learners delivered their oral speeches dressed in full astronaut costumes. The performances were imaginative, confident, and showed remarkable command of the language. Baie geluk, Graad 6!",
          },
          {
            type: "paragraph",
            text: "Our Grade 7 learners were officially inducted as School Mentors in a meaningful ceremony that underscores the leadership role our most senior primary school pupils play in guiding and supporting younger learners. This mentorship programme is a source of great pride for our school community.",
          },
        ],
      },
      {
        type: "preschool",
        icon: "heart",
        label: "Pre-School News",
        content: [
          {
            type: "paragraph",
            text: "Our Cubs and Grade 000 classrooms have been buzzing with curiosity and creativity this week. The Cubs explored the fascinating topic of 'Our Bodies', engaging in hands-on learning by constructing matchstick body structures — a wonderful blend of science and fine motor skill development.",
          },
          {
            type: "paragraph",
            text: "Grade 000 learners dove into the colourful world of arts and crafts, exploring colour recognition through a range of sensory and creative activities. The joy and enthusiasm in these early learning classrooms is a testament to our exceptional Foundation Phase team.",
          },
        ],
      },
      {
        type: "event",
        icon: "users",
        label: "Coming Soon",
        title: "Oliver with a Twist",
        subtitle: "Riverview Prep Annual School Play",
        image: "/images/oliver-with-a-twist.jpg",
        description:
          "Mark your calendars — our annual school play is just weeks away! \"Oliver with a Twist\" promises to be an unforgettable evening of theatre. Costumes have been extended to 17 March. Tickets are now available — do not miss out.",
        details: [
          { label: "Dates", value: "24, 25 & 26 March 2026" },
          { label: "Time", value: "18:00" },
          { label: "Venue", value: "Riverview Prep School Hall, Malelane" },
          {
            label: "Dinner Theatre (24 & 25 Mar)",
            value: "R280 per person (meal included)",
          },
          {
            label: "General Seating (26 Mar)",
            value: "R80 per person (tuckshop refreshments)",
          },
        ],
        cta: { label: "View Event Details", href: "/events/oliver-with-a-twist" },
      },
    ],
  },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface NewsletterData {
  slug: string;
  term: string;
  issue: string;
  date: string;
  isoDate: string;
  highlights: string[];
  headline: string;
  subheadline: string;
  heroImage: string;
  heroImageAlt: string;
  seo: { title: string; description: string; keywords: string[] };
  sections: Section[];
}

type Section =
  | HeadSection
  | SportSection
  | DatesSection
  | EventSection
  | AcademicSection
  | PreschoolSection;

interface HeadSection {
  type: "head";
  icon: string;
  label: string;
  author: string;
  content: ContentBlock[];
}

interface SportSection {
  type: "sport";
  icon: string;
  label: string;
  content: ContentBlock[];
}

interface AcademicSection {
  type: "academic";
  icon: string;
  label: string;
  content: ContentBlock[];
}

interface PreschoolSection {
  type: "preschool";
  icon: string;
  label: string;
  content: ContentBlock[];
}

interface DatesSection {
  type: "dates";
  icon: string;
  label: string;
  items: { date: string; title: string; detail: string }[];
}

interface EventSection {
  type: "event";
  icon: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  details: { label: string; value: string }[];
  cta: { label: string; href: string };
}

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "highlight"; title: string; text: string }
  | { type: "achievement"; title: string; athlete: string; detail: string };

// ─── METADATA ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = newsletters[params.slug];
  if (!data) return { title: "Not Found" };
  return {
    title: data.seo.title,
    description: data.seo.description,
    keywords: data.seo.keywords,
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
      type: "article",
      publishedTime: data.isoDate,
      images: [{ url: data.heroImage }],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(newsletters).map((slug) => ({ slug }));
}

// ─── SECTION RENDERERS ────────────────────────────────────────────────────────

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return (
            <p key={i} className="text-brand-green/75 leading-relaxed text-[1.05rem]">
              {block.text}
            </p>
          );
        }
        if (block.type === "highlight") {
          return (
            <div
              key={i}
              className="relative border-l-4 border-brand-gold bg-brand-gold/5 rounded-r-2xl p-6 my-8"
            >
              <p className="font-bold text-brand-green mb-2">{block.title}</p>
              <p className="text-brand-green/70 leading-relaxed">{block.text}</p>
            </div>
          );
        }
        if (block.type === "achievement") {
          return (
            <div
              key={i}
              className="bg-brand-green rounded-[2rem] p-8 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-5 h-5 text-brand-gold" />
                <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">
                  Achievement
                </span>
              </div>
              <h4 className="text-xl font-bold mb-1">{block.title}</h4>
              <p className="text-brand-gold/80 text-sm font-semibold mb-4">
                {block.athlete}
              </p>
              <p className="text-white/75 leading-relaxed">{block.detail}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function SectionIcon({ icon }: { icon: string }) {
  const cls = "w-5 h-5";
  switch (icon) {
    case "trophy":
      return <Trophy className={cls} />;
    case "book":
      return <BookOpen className={cls} />;
    case "users":
      return <Users className={cls} />;
    case "calendar":
      return <Calendar className={cls} />;
    default:
      return <Heart className={cls} />;
  }
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function NewsletterArticle({
  params,
}: {
  params: { slug: string };
}) {
  const data = newsletters[params.slug];
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SecondaryBanner 
        title="Weekly Newsletters" 
        subtitle={`${data.term} · ${data.issue} · ${data.date}`}
      />

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-0 bg-white overflow-hidden">
        {/* Back link */}
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
              issue={data.issue}
              term={data.term}
              date={data.date}
              category="Newsletter"
              title={data.headline}
              highlights={data.highlights}
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
              {data.sections.map((section, si) => {
                /* Head / Sport / Academic / Preschool */
                if (
                  section.type === "head" ||
                  section.type === "sport" ||
                  section.type === "academic" ||
                  section.type === "preschool"
                ) {
                  return (
                    <div key={si}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-brand-green flex items-center justify-center text-brand-gold">
                          <SectionIcon icon={section.icon} />
                        </div>
                        <div>
                          <div className="telemetry-monospace text-brand-green">
                            {section.label}
                          </div>
                          {"author" in section && (
                            <div className="text-xs text-brand-green/40 font-semibold mt-0.5">
                              {section.author}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg border-4 border-white group">
                        <Image
                          src="https://images.unsplash.com/photo-1546410731-13b1f19331cf?q=80&w=1200&auto=format&fit=crop"
                          alt={section.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-green/20 to-transparent" />
                      </div>
                      <ContentBlocks blocks={section.content} />
                    </div>
                  );
                }

                /* Important Dates */
                if (section.type === "dates") {
                  return (
                    <div key={si}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-brand-green flex items-center justify-center text-brand-gold">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="telemetry-monospace text-brand-green">
                          {section.label}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {section.items.map((item, ii) => (
                          <div
                            key={ii}
                            className="flex gap-6 p-6 rounded-[1.5rem] border border-brand-green/8 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center bg-brand-green text-white rounded-2xl py-3 px-2 text-center">
                              <Calendar className="w-4 h-4 text-brand-gold mb-1" />
                              <span className="text-[9px] font-bold leading-tight">
                                {item.date}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold mb-1">{item.title}</h4>
                              <p className="text-sm text-brand-green/60 leading-relaxed">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                /* Event Spotlight */
                if (section.type === "event") {
                  return (
                    <div
                      key={si}
                      className="rounded-[3rem] overflow-hidden border border-brand-green/8 shadow-xl flex flex-col md:flex-row bg-brand-cream"
                    >
                      {/* Left: Banner Image */}
                      <div className="relative w-full md:w-[45%] aspect-video md:aspect-auto overflow-hidden">
                        <Image
                          src={section.image}
                          alt={section.title}
                          fill
                          className="object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-cream/10" />
                      </div>

                      {/* Right: Content details */}
                      <div className="p-8 md:p-12 md:w-[55%] flex flex-col justify-center">
                        <div className="mb-6">
                          <span className="px-3 py-1.5 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">
                            {section.label}
                          </span>
                          <h3 className="text-3xl font-bold text-brand-green">
                            {section.title}
                          </h3>
                          <p className="text-brand-gold font-serif italic text-lg">
                            {section.subtitle}
                          </p>
                        </div>
                        
                        <p className="text-brand-green/70 leading-relaxed mb-8 text-sm">
                          {section.description}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          {section.details.map((d, di) => (
                            <div key={di} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">
                                  {d.label}
                                </span>
                                <p className="font-semibold text-sm text-brand-green">
                                  {d.value}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <Link
                            href={section.cta.href}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green/90 transition-colors text-sm"
                          >
                            {section.cta.label}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8 lg:sticky lg:top-32">
              {/* Issue info */}
              <div className="bg-brand-cream rounded-[2rem] p-8">
                <div className="telemetry-monospace text-brand-green mb-6">
                  THIS EDITION
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">
                        Published
                      </p>
                      <p className="font-semibold text-sm">{data.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">
                        Edition
                      </p>
                      <p className="font-semibold text-sm">{data.issue}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-green/40">
                        Reading Time
                      </p>
                      <p className="font-semibold text-sm">
                        {data.sections.length + 2} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-brand-green rounded-[2rem] p-8 text-white">
                <div className="telemetry-monospace text-brand-gold mb-6">
                  IN THIS EDITION
                </div>
                <div className="space-y-3">
                  {data.sections.map((section, si) => (
                    <div key={si} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                      <span className="text-white/70 text-sm font-semibold">
                        {section.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscribe */}
              <div className="border border-brand-green/10 rounded-[2rem] p-8">
                <Mail className="w-6 h-6 text-brand-gold mb-4" />
                <h4 className="font-bold text-lg mb-2 leading-tight">
                  Subscribe to the Reporter
                </h4>
                <p className="text-sm text-brand-green/60 leading-relaxed mb-6">
                  Get every edition of the Riverview Reporter delivered straight
                  to your inbox.
                </p>
                <Link
                  href="/#newsletter"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white font-bold rounded-full text-sm hover:bg-brand-green/90 transition-colors"
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Nav to other edition */}
              <div className="border border-brand-green/10 rounded-[2rem] p-8">
                <div className="telemetry-monospace text-brand-green mb-4">
                  OTHER EDITIONS
                </div>
                {Object.values(newsletters)
                  .filter((n) => n.slug !== data.slug)
                  .map((n) => (
                    <Link
                      key={n.slug}
                      href={`/news/${n.slug}`}
                      className="group flex items-start gap-4"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={n.heroImage}
                          alt={n.heroImageAlt}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-1">
                          {n.date}
                        </p>
                        <p className="font-bold text-sm leading-snug group-hover:text-brand-green transition-colors line-clamp-2">
                          {n.headline}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="container mx-auto px-6 text-center">
          <div className="telemetry-monospace text-brand-green mb-4">
            STAY CONNECTED
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Enjoyed this{" "}
            <span className="drama-text text-brand-gold">Edition?</span>
          </h2>
          <p className="text-brand-green/60 mb-8 max-w-md mx-auto">
            Never miss a Riverview Reporter — subscribe to receive every
            edition directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/news"
              className="inline-flex items-center gap-3 px-8 py-4 border border-brand-green/20 text-brand-green font-bold rounded-full hover:bg-brand-green hover:text-white transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> All Editions
            </Link>
            <Link
              href="/#newsletter"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green/90 transition-colors text-sm"
            >
              Subscribe to Reporter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
