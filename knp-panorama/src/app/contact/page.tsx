import type { Metadata } from 'next';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to Kruger Panorama Experience on ${SITE.phone} about safaris, Panorama Route tours, transfers and stays across the Mpumalanga Lowveld.`,
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        title="Contact"
        image="/images/heroes/accommodation.webp"
        imageAlt="Open-air lodge dining area in the bushveld at dusk"
        intro="We're based in the Lowveld and always happy to chat about your travel plans."
      />

      <section className="py-20">
        <div className="container-kpe grid gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div>
            <h2>Talk To Us</h2>
            <p className="mt-4 text-text/70 normal-case">
              Whether you need a quick transfer or a full safari, a conversation
              is the best place to start. Reach us any way you prefer.
            </p>

            <dl className="mt-8 space-y-6">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-amber-text" />
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a href={SITE.phoneHref} className="hover:underline">
                    {SITE.phone}
                  </a>
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-amber-text" />
                <dt className="sr-only">Email</dt>
                <dd>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="hover:underline"
                  >
                    {SITE.email}
                  </a>
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 text-amber-text" />
                <dt className="sr-only">WhatsApp</dt>
                <dd>
                  <a
                    href={SITE.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Message us on WhatsApp
                  </a>
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-amber-text" />
                <dt className="sr-only">Region</dt>
                <dd>{SITE.region}</dd>
              </div>
            </dl>

            <p className="mt-6 text-xs text-text/70">
              The business trades as Kruger Panorama Experience, {SITE.legalName}.
            </p>

            {/* Map shows service area; no street address is published */}
            <iframe
              src="https://www.google.com/maps?q=Hazyview,+Mpumalanga,+South+Africa&output=embed"
              title="Map of the Hazyview area, Mpumalanga"
              loading="lazy"
              className="mt-8 h-64 w-full rounded border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Right column */}
          <div>
            <QuoteForm
              variant="contact"
              sourcePage="/contact"
              title="Send Us A Message"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
