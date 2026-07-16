import { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  MapPin,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
} from "lucide-react";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Admissions | Nyoni",
  description:
    "Join Nyoni – a simple, welcoming process to become part of our learning community.",
};

const steps = [
  {
    number: 1,
    title: "Enquire",
    icon: MessageCircle,
    desc: "Reach out by phone, email or our contact form. We’re here to answer your questions.",
  },
  {
    number: 2,
    title: "Book a Tour",
    icon: MapPin,
    desc: "Visit our campus, meet the team and experience the Nyoni environment first-hand.",
  },
  {
    number: 3,
    title: "Application",
    icon: FileText,
    desc: "Complete the short application for School (Grade 4‑7) or the Tutor Centre (Grade 8‑12).",
  },
  {
    number: 4,
    title: "Enrollment",
    icon: CheckCircle2,
    desc: "Welcome to the Nyoni family! Finalise your child’s place and let the journey begin.",
  },
];

export default function AdmissionsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero / Intro */}
      <section className="px-4 pt-20 pb-12 md:px-8 max-w-4xl mx-auto text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-navy mb-4">
          Admissions
        </h1>
        <p className="text-lg text-brand-navy/70 max-w-2xl mx-auto">
          We’re delighted you’re considering Nyoni for your child&apos;s education.
          Our admissions process is warm, personal and straightforward. Every family
          is welcome – let’s start a conversation.
        </p>
      </section>

      {/* How to Join */}
      <section className="px-4 md:px-8 max-w-4xl mx-auto pb-16">
        <h2 className="font-heading text-3xl font-bold text-brand-navy text-center mb-12">
          How to Join
        </h2>
        <div className="space-y-10">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-5">
              {/* Icon circle with number badge */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-brand-teal flex items-center justify-center text-white">
                  <step.icon className="w-7 h-7" />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-sand text-white flex items-center justify-center text-xs font-bold">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-brand-navy mb-1">
                  {step.title}
                </h3>
                <p className="text-brand-navy/70">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 max-w-3xl mx-auto pb-24 text-center">
        <div className="bg-brand-sky/30 rounded-3xl p-8 md:p-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-6">
            Ready to take the first step?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex items-center gap-2 bg-brand-navy text-white font-medium px-8 py-3 rounded-full hover:bg-brand-teal transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call {siteConfig.phone}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 bg-brand-navy text-white font-medium px-8 py-3 rounded-full hover:bg-brand-teal transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email {siteConfig.email}
            </a>
          </div>
          <p className="text-brand-navy/60">
            Prefer a full form?{" "}
            <Link
              href="/contact"
              className="underline font-medium hover:text-brand-teal transition-colors"
            >
              Send us a message
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
