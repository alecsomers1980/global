import type { Metadata } from "next";
import { company } from "@/lib/site/company";
import { cities } from "@/lib/site/cities";
import ContactForm from "@/components/forms/ContactForm";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import Container from "@/components/site/Container";
import PageHeader from "@/components/site/PageHeader";
import ParallaxSection from "@/components/site/ParallaxSection";
import { Mail, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact H&S Labour Brokers",
  description:
    "Get in touch with H&S Labour Brokers. We provide recruitment, TES, payroll, vetting, HR & IR, and CV response handling services across South Africa.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        intro="Whether you need permanent staff, temporary workers, or help with payroll and compliance — we're here. Reach out using the form and we'll get back to you within one business day."
        imageSrc="/images/about-handshake.jpg"
        imageAlt="Get in touch with H&S Labour Brokers"
      />
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-navy">
                Contact details
              </h2>
              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark">
                    <Mail className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">Email</p>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-slate-600 transition-colors hover:text-green-dark"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark">
                    <Phone className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">Phone</p>
                    <a
                      href="tel:0114684192"
                      className="text-slate-600 transition-colors hover:text-green-dark"
                    >
                      011 468 4192
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark">
                    <Clock className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      Office hours
                    </p>
                    <p className="text-slate-600">Mon–Fri, 8:30–16:00</p>
                  </div>
                </div>
              </div>

              <h3 className="mt-10 text-lg font-semibold text-navy">
                Areas we serve
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-700">
                {cities.map((city) => (
                  <li key={city.slug} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-green-dark">
                      •
                    </span>
                    {city.name}, {city.province}
                  </li>
                ))}
              </ul>

              {company.accreditations.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-navy">
                    Accreditations
                  </h3>
                  <ul className="mt-3 space-y-1 text-sm text-slate-700">
                    {company.accreditations.map((acc, i) => (
                      <li key={i}>{acc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <ContactForm heading="Send us a message" />
            </div>
          </div>
        </Container>
      </section>

      <ParallaxSection
        image="/images/parallax/warehouse.jpg"
        eyebrow="Nationwide coverage"
        title="Serving employers and job seekers across South Africa"
        subtitle="From Johannesburg to Cape Town, Durban, Pretoria, Gqeberha and Bloemfontein — recruitment, TES and payroll, since 1998."
      />
    </>
  );
}