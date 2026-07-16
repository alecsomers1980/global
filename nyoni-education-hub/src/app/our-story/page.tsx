import type { Metadata } from "next";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { siteConfig, vision, mission, values } from "@/lib/content";

export const metadata: Metadata = {
  title: `Our Story | ${siteConfig.name}`,
  description: `Learn about the story, vision, and values that drive ${siteConfig.name}.`,
};

function getIcon(iconName: string) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[iconName] || LucideIcons.Heart;
  return <Icon className="h-8 w-8 text-brand-teal mx-auto" aria-hidden="true" />;
}

export default function OurStoryPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-sky to-brand-teal/20 py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/60 shadow-lg backdrop-blur">
            <LucideIcons.BookOpen className="h-12 w-12 text-brand-teal" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-navy tracking-tight">
            Our Story
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-brand-navy/80 leading-relaxed max-w-2xl mx-auto">
            Nyoni Education Hub was founded with a simple belief: every child deserves an education
            that nurtures curiosity, character, and a deep connection to the world around them.
            Rather than a one-size-fits-all path, we set out to create a learning environment
            where academic excellence walks hand in hand with empathy, creativity, and environmental stewardship.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-cream mb-8">
            <LucideIcons.Eye className="h-8 w-8 text-brand-sand" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-navy mb-6">
            Our Vision
          </h2>
          <p className="text-xl text-brand-navy/70 leading-relaxed">{vision}</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-brand-cream/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-8">
            <LucideIcons.Target className="h-8 w-8 text-brand-teal" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-navy mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-brand-navy/70 leading-relaxed">{mission}</p>
        </div>
      </section>

      {/* What We Value Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-navy text-center mb-12">
            What We Value
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-center p-8 bg-brand-cream/50 rounded-2xl border border-brand-sky/30 hover:shadow-md transition-shadow"
              >
                <div className="mb-5">{getIcon(value.icon)}</div>
                <h3 className="font-heading font-semibold text-lg text-brand-navy text-center">
                  {value.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20 px-4 bg-brand-navy">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6">
            Come See What Makes Us Different
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            We would love to welcome your family for a visit. Walk through our spaces, meet our
            educators, and experience the warmth of our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 rounded-full bg-brand-sand px-8 py-3 font-semibold text-white hover:bg-brand-sand/90 transition-colors"
            >
              <LucideIcons.ArrowRight className="h-5 w-5" />
              Admissions
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <LucideIcons.Mail className="h-5 w-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
