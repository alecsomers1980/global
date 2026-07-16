import type { Metadata } from "next";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { siteConfig, philosophyPoints } from "@/lib/content";

export const metadata: Metadata = {
  title: `Our Philosophy | ${siteConfig.name}`,
  description: `How we think about learning — a progressive approach that puts understanding before memorisation.`,
};

// Pair each philosophy point with a suitable icon and a short elaboration.
const enrichedPoints = [
  {
    text: philosophyPoints[0],
    icon: LucideIcons.Lightbulb,
    elaboration:
      "We create space for questions, exploration, and discovery — because lasting learning happens when curiosity leads the way.",
  },
  {
    text: philosophyPoints[1],
    icon: LucideIcons.Brain,
    elaboration:
      "Deep understanding matters more than quick answers. We focus on helping children build mental models that they can adapt to new situations.",
  },
  {
    text: philosophyPoints[2],
    icon: LucideIcons.Compass,
    elaboration:
      "With guidance rather than rigid instruction, our learners develop an inner sense of direction, learning how to make thoughtful choices and reflect on their growth.",
  },
  {
    text: philosophyPoints[3],
    icon: LucideIcons.Wrench,
    elaboration:
      "Knowledge becomes meaningful when children can use it to create, solve problems, and contribute to their community — we make learning immediately relevant.",
  },
];

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-sky to-brand-teal/20 py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/60 shadow-lg backdrop-blur">
            <LucideIcons.Lightbulb className="h-12 w-12 text-brand-sand" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-navy tracking-tight">
            Progressive Education
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-brand-navy/80 leading-relaxed max-w-2xl mx-auto">
            We believe education should move with the future — not simply repeat the past.
            Our approach prioritises understanding over memorisation, guiding children to
            become curious, adaptable, and compassionate learners who are ready for a changing world.
          </p>
        </div>
      </section>

      {/* Philosophy Points Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-navy text-center mb-14">
            What Guides Us
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {enrichedPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-6 p-6 sm:p-8 rounded-2xl border border-brand-sky/30 bg-brand-cream/50 hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 flex items-start justify-center w-12 h-12 rounded-xl bg-brand-teal/10">
                    <Icon className="h-6 w-6 text-brand-teal mt-3" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy text-lg mb-2 leading-snug">
                      {point.text}
                    </p>
                    <p className="text-brand-navy/70 leading-relaxed">{point.elaboration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real-World Outcomes Section */}
      <section className="py-20 px-4 bg-brand-cream/60">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-8">
            <LucideIcons.Sprout className="h-8 w-8 text-brand-teal" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-navy mb-6">
            Building Strong Foundations for Life
          </h2>
          <p className="text-lg text-brand-navy/70 leading-relaxed mb-10">
            Because our approach values process over product, children develop the confidence
            to speak up, the resilience to work through challenges, and the critical thinking
            skills to ask better questions. These aren’t just academic outcomes — they are
            life outcomes that prepare young people to thrive in any environment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/school"
              className="inline-flex items-center gap-2 rounded-full bg-brand-sand px-8 py-3 font-semibold text-white hover:bg-brand-sand/90 transition-colors"
            >
              <LucideIcons.ArrowRight className="h-5 w-5" />
              Our School
            </Link>
            <Link
              href="/tutor-centre"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-teal px-8 py-3 font-semibold text-brand-teal hover:bg-brand-teal/10 transition-colors"
            >
              <LucideIcons.BookOpen className="h-5 w-5" />
              Tutor Centre
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}