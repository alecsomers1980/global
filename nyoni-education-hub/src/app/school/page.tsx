import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Puzzle, ClipboardCheck, Home, Leaf, Heart, Sun, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "School – Grade 4 to 7 | The Fynbos Academy",
  description:
    "Our warm, nature‑connected school programme for Grades 4–7. CAPS curriculum, project‑based learning, limited exams and no homework in a calm, supportive small‑class setting.",
};

const features = [
  {
    icon: BookOpen,
    title: "CAPS Curriculum",
    description:
      "A rich, well‑rounded CAPS foundation that makes learning relevant, engaging and thorough.",
  },
  {
    icon: Puzzle,
    title: "Project Based Learning",
    description:
      "Hands‑on, creative projects that spark curiosity and build deep understanding across subjects.",
  },
  {
    icon: ClipboardCheck,
    title: "Limited Exams",
    description:
      "We assess for growth, not pressure. Exams are kept intentional and low‑stress.",
  },
  {
    icon: Home,
    title: "No Homework",
    description:
      "Learning stays at school. Afternoons are reserved for family, play and rest.",
  },
];

const whyPoints = [
  {
    icon: Sun,
    title: "Critical thinking before memorising",
    text: "We guide children to ask “why” and “how” instead of simply recalling facts. Understanding is celebrated over rote learning.",
  },
  {
    icon: Heart,
    title: "Calm, supportive environment",
    text: "Small classes and gentle rhythms create a haven for anxious, introverted and neurodivergent learners. Every child is seen and valued.",
  },
  {
    icon: Leaf,
    title: "Nature‑connected learning",
    text: "Outdoor lessons, eco‑projects and a deep respect for the environment run through every part of the day.",
  },
];

export default function SchoolPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-brand-cream">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <span className="inline-block rounded-full bg-brand-sky/60 px-4 py-1.5 text-sm font-medium tracking-wide text-brand-navy">
                Grade 4 – 7
              </span>
              <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                School
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-navy/80">
                A gentle, academically rich programme where children grow into
                confident, curious thinkers – surrounded by nature and supported
                by educators who truly know them.
              </p>
              <div className="mt-8">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-teal px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-teal/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
                >
                  Book a Tour
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="flex h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-sky to-brand-teal/20 shadow-soft sm:h-96">
                <BookOpen className="h-24 w-24 text-brand-navy/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              How we learn
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-navy/70">
              A different kind of school day – built around how children
              actually learn best.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-brand-sky/40 bg-brand-sky/20 p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-brand-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why families choose our School programme */}
      <section className="bg-brand-sky/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Why families choose our School programme
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-navy/70">
              Parents tell us they see their children come alive – and stay
              kind.
            </p>
          </div>
          <div className="mt-16 grid gap-10 sm:grid-cols-1 lg:grid-cols-3">
            {whyPoints.map((point) => (
              <div
                key={point.title}
                className="flex flex-col items-start rounded-2xl border border-brand-sky/50 bg-white/70 p-6 backdrop-blur-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
                  <point.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-brand-navy">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-brand-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to see our learning spaces?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand-sky/80">
            Book a personal tour and experience the warm, calm atmosphere for
            yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-sand px-6 py-3.5 text-sm font-semibold text-brand-navy shadow-sm transition hover:bg-brand-sand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sand"
            >
              Book a Tour
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-brand-sky/40 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:border-brand-sky hover:bg-brand-sky/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
