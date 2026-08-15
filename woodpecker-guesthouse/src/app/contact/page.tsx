import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/site/ContactForm";
import Reveal from "@/components/site/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Woodpecker Guesthouse for accommodation, restaurant and conferencing enquiries in Hazyview, Mpumalanga.",
};

export default function ContactPage() {
  return (
    <main>
      <div className="relative h-[36vh] min-h-[280px] overflow-hidden">
        <Image
          src="/images/home-entrance.webp"
          alt="Woodpecker Guesthouse entrance"
          fill
          priority
          className="object-cover hero-photo"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <Reveal className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-8 text-white">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-2">We&apos;re Always Happy To Help</p>
          <h1 className="font-display text-4xl md:text-5xl">Contact Us</h1>
        </Reveal>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-5 gap-12">
        <Reveal className="lg:col-span-2">
          <h2 className="font-display text-2xl text-ink mb-6">Get In Touch</h2>
          <ul className="space-y-6 text-muted mb-8">
            <li>
              <p className="text-ink font-medium mb-1">Physical Address</p>
              <a href={SITE.address.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">
                {SITE.address.line1}<br />{SITE.address.line2}
              </a>
            </li>
            <li>
              <p className="text-ink font-medium mb-1">Phone</p>
              <a href={SITE.phone.href} className="hover:text-terracotta transition-colors">{SITE.phone.display}</a>
              {" / "}
              <a href={SITE.phoneSecondary.href} className="hover:text-terracotta transition-colors">{SITE.phoneSecondary.display}</a>
            </li>
            <li>
              <p className="text-ink font-medium mb-1">Email Address</p>
              <a href={`mailto:${SITE.email}`} className="hover:text-terracotta transition-colors break-all">{SITE.email}</a>
            </li>
          </ul>
          <div className="overflow-hidden border border-line h-64">
            <iframe
              src={SITE.address.mapsEmbedSrc}
              title={SITE.address.full}
              loading="lazy"
              className="w-full h-full border-0"
            />
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-3">
          <h2 className="font-display text-2xl text-ink mb-6">Send An Enquiry</h2>
          <p className="text-muted mb-8">Send us an enquiry and we&apos;ll get back to you as soon as we can.</p>
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
