import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import QuoteForm from "@/components/QuoteForm";
import { company } from "@/lib/content";
import { MapPin, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact – East Lake Drilling",
  description:
    "Request a free quote for borehole drilling, pump installation, water purification, and water storage in Pretoria and surrounding areas.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Request a quote"
        subtitle="Tell us about your site and we'll get back to you."
        image="/images/hero/quote-32.jpg"
      />

      <section className="container-px py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left column – contact details */}
          <div>
            <SectionHeading
              eyebrow="Get in touch"
              title="Talk to a borehole specialist"
            />

            <hr className="section-rule" />

            <div className="mt-8 space-y-6">
              {/* Location */}
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-ink">{company.location}</p>
                  <p className="text-sm text-ink/70">
                    <strong>Service area:</strong> {company.serviceArea}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-brand mt-0.5 shrink-0" />
                <div>
                  <a
                    href={company.phoneHref}
                    className="font-medium text-ink hover:text-brand transition-colors"
                  >
                    {company.phone}
                  </a>
                  <p className="text-sm text-ink/70">Call for immediate assistance</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-brand mt-0.5 shrink-0" />
                <div>
                  <a
                    href={`mailto:${company.email}`}
                    className="font-medium text-ink hover:text-brand transition-colors break-all"
                  >
                    {company.email}
                  </a>
                  <p className="text-sm text-ink/70">We respond within 24 hours</p>
                </div>
              </div>
            </div>

            <p className="mt-10 text-ink/80 leading-relaxed">
              We welcome both domestic and commercial enquiries across
              {company.serviceArea}. Our team will assess your site, water needs,
              and provide a transparent, competitive quote.
            </p>
          </div>

          {/* Right column – quote form */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
            <h3 className="text-xl font-semibold text-ink mb-6">
              Request a free quote
            </h3>
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}