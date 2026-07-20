import type { Metadata } from "next";
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <PageBanner video="/videos/leaves-banner.mp4"
          eyebrow="CONTACT"
          title="We'd love to"
          accent="hear from you"
          subtitle="Diana and the team answer personally."
        />
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-20">
          <form action="#" className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Your name"
              className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest"
            />
            <input
              type="email"
              placeholder="Email address"
              className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest"
            />
            <textarea
              placeholder="Your message"
              rows={6}
              className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-moss"
              >
                Send message
              </button>
              <p className="mt-3 text-xs text-muted">
                The contact form goes live with the full launch — for now this is a
                preview of the new site.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
