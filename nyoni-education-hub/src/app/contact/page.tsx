import { Metadata } from "next";
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/lib/content";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Nyoni",
  description: "Get in touch with Nyoni – we’d love to hear from you.",
};

export default function ContactPage() {
  const { line1, line2, line3 } = siteConfig.address;

  return (
    <main className="min-h-screen bg-white">
      <section className="px-4 pt-20 pb-24 md:px-8 max-w-6xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-navy text-center mb-12">
          Contact
        </h1>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Contact info */}
          <div className="bg-brand-cream/50 rounded-3xl p-8 md:p-10 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-brand-navy mb-6">
              Reach Nyoni
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-brand-teal shrink-0 mt-1" />
                <div className="text-brand-navy/80">
                  <p className="font-medium">Address</p>
                  <p>{line1}</p>
                  <p>{line2}</p>
                  <p>{line3}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-brand-teal shrink-0" />
                <div>
                  <p className="font-medium text-brand-navy">Phone</p>
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="text-brand-navy/80 hover:text-brand-teal transition-colors"
                  >
                    {siteConfig.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-brand-teal shrink-0" />
                <div>
                  <p className="font-medium text-brand-navy">Email</p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-brand-navy/80 hover:text-brand-teal transition-colors"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Enquiry form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-brand-sky/30">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
