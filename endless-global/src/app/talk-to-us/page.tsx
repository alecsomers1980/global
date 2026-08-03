import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Talk To Us",
  description:
    "Reach out to Endless Global Point to discuss your goals. Call +27 83 372 7295 or email philipokoh24@gmail.com. Based in Cape Town, South Africa.",
  alternates: { canonical: "/talk-to-us" },
};

const contactCards = [
  {
    label: "Call us",
    value: "+27 83 372 7295",
    href: "tel:+27833727295",
  },
  {
    label: "Email us",
    value: "philipokoh24@gmail.com",
    href: "mailto:philipokoh24@gmail.com",
  },
  {
    label: "Our Location",
    value: "Cape Town, South Africa",
    href: null,
  },
];

export default function TalkToUsPage() {
  return (
    <>
      <Hero
        bgImage="/images/Group-11.png"
        titleTop="Let's Start the Conversation"
        titleMain="That Leads to Results"
        subtitle="We're here to help connect you with the right experts for your needs. Reach out today to discuss your goals, ask questions, or find out how we can guide you toward the best solution."
      />

      {/* Contact cards */}
      <section className="bg-white py-16 md:py-20">
        <div className="eg-container grid gap-6 sm:grid-cols-3">
          {contactCards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-line bg-white p-8 text-center shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {c.label}
              </p>
              {c.href ? (
                <a
                  href={c.href}
                  className="mt-2 block break-words font-semibold text-brand hover:underline"
                >
                  {c.value}
                </a>
              ) : (
                <p className="mt-2 font-semibold text-brand">{c.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="bg-section py-16 md:py-24">
        <div className="eg-container grid items-start gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow">Talk to Us</span>
            <h2 className="section-title mt-4">
              Start Your Journey With the Right Partner
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Finding the right expertise shouldn&apos;t be complicated. Whether
              you&apos;re seeking investment guidance, financial direction, trade
              opportunities, or consulting support, we&apos;ll connect you with
              trusted professionals who deliver results. Reach out today, your
              next opportunity begins with the right partnership.
            </p>
          </div>
          <ContactForm variant="full" />
        </div>
      </section>
    </>
  );
}
