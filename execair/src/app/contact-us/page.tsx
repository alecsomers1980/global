import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Exec-Air — Air Conditioning Krugersdorp & Johannesburg",
  description:
    "Get in touch with Exec-Air Air Conditioning. Call +27 11 477 3920, email info@execair.co.za, or visit us at 296 Voortrekker Road, Krugersdorp. Request a quote today.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    type: "website",
    url: "/contact-us",
    title: "Contact Exec-Air — Air Conditioning Krugersdorp & Johannesburg",
    description:
      "Call +27 11 477 3920 or visit us at 296 Voortrekker Road, Krugersdorp.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_ZA",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Exec-Air — Air Conditioning Krugersdorp"
        subtitle="Our sales, technical and installation departments are ready to assist with any HVAC enquiry — commercial, industrial or residential — across Krugersdorp, Johannesburg and Gauteng."
      />

      {/* Contact Info + Form */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="mb-8 text-2xl font-bold text-brand-navy">Head Office</h2>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-teal/10">
                    <svg className="h-6 w-6 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brand-navy/50">Address</p>
                    <a
                      href="https://goo.gl/maps/JVQQcexSavN8eKYq7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg leading-relaxed text-brand-navy transition-colors hover:text-brand-teal"
                    >
                      296 Voortrekker Road
                      <br />
                      Krugersdorp
                      <br />
                      Gauteng, 1739
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-teal/10">
                    <svg className="h-6 w-6 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brand-navy/50">Contact Number</p>
                    <a
                      href="tel:+27114773920"
                      className="text-lg font-semibold text-brand-navy transition-colors hover:text-brand-teal"
                    >
                      +27 11 477 3920
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-teal/10">
                    <svg className="h-6 w-6 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brand-navy/50">Email</p>
                    <a
                      href="mailto:info@execair.co.za"
                      className="text-lg font-semibold text-brand-navy transition-colors hover:text-brand-teal"
                    >
                      info@execair.co.za
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brand-navy/50">WhatsApp</p>
                    <a
                      href="https://wa.me/27826190881"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-brand-navy transition-colors hover:text-green-600"
                    >
                      +27 82 619 0881
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-8 shadow-sm md:p-10">
                <h2 className="mb-2 text-2xl font-bold text-brand-navy">Contact Us Form</h2>
                <p className="mb-8 text-brand-navy/50">
                  Fill in the form below and one of our consultants will get back to you.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="bg-white">
        <div className="h-96 w-full overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4287.704055975372!2d27.789532599999994!3d-26.092534399999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e950aa19fca480f%3A0xeb7f8eae960b19bf!2sExec-Air%20Air%20Conditioning%20(Pty)%20Ltd!5e1!3m2!1sen!2sza!4v1778079839329!5m2!1sen!2sza"
            title="Exec-Air Air Conditioning (Pty) Ltd — 296 Voortrekker Road, Krugersdorp"
            width="100%"
            height="100%"
            className="border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="border-b border-gray-100 bg-white px-6 py-4 text-center">
          <a
            href="https://goo.gl/maps/JVQQcexSavN8eKYq7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand-teal transition-colors hover:text-brand-teal/80"
          >
            Open in Google Maps →
          </a>
        </div>
      </section>

      {/* Bottom CTA with editorial */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6 text-center">
          <Image
            src="/images/icons/OVER-35-YEARS-OF-EXPERIENCE.png"
            alt="Over 35 Years of Experience"
            width={300}
            height={300}
            className="mx-auto mb-8 h-auto w-64"
          />
          <Link
            href="/docs/EAMC-COMPANY-PROFILE-2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg"
          >
            VIEW OUR LATEST EDITORIAL HERE
          </Link>
        </div>
      </section>
    </>
  );
}
