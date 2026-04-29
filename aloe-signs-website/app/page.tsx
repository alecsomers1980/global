import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import ImageGrid from '@/components/ImageGrid';
import ServicesList from '@/components/ServicesList';
import AboutSection from '@/components/AboutSection';
import ShopSpecials from '@/components/ShopSpecials';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aloe Signs | Branding, Printing & Signage Company in South Africa',
  description: 'Professional branding, signage & large-format printing company in South Africa. We design, print & install high-impact branding that gets your business noticed. 25+ years experience, 10 000+ projects completed.',
  keywords: 'branding company South Africa, signage company Gauteng, large format printing, vehicle wraps, billboards, building wraps, fleet branding, promotional items, screen printing, wall art, set building',
  openGraph: {
    title: 'Aloe Signs | Unmissable Branding Solutions',
    description: 'Professional branding, signage & large-format printing in South Africa. High-impact visual branding built to be seen.',
    url: 'https://aloesigns.co.za',
    siteName: 'Aloe Signs',
    locale: 'en_ZA',
    type: 'website',
    images: [
      {
        url: 'https://aloesigns.co.za/aloe-logo.png',
        width: 800,
        height: 600,
        alt: 'Aloe Signs - Branding, Printing & Signage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aloe Signs | Unmissable Branding Solutions',
    description: 'Professional branding, signage & large-format printing in South Africa.',
  },
  alternates: {
    canonical: 'https://aloesigns.co.za',
  },
};

// JSON-LD Structured Data for LocalBusiness + Organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://aloesigns.co.za/#business',
      name: 'Aloe Signs',
      description: 'Professional branding, signage & large-format printing company in South Africa. We design, print & install high-impact branding that gets your business noticed.',
      url: 'https://aloesigns.co.za',
      logo: 'https://aloesigns.co.za/aloe-logo.png',
      image: 'https://aloesigns.co.za/aloe-logo.png',
      telephone: '+27688838049',
      email: 'team@aloesigns.co.za',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Johannesburg',
        addressRegion: 'Gauteng',
        addressCountry: 'ZA',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -26.2041,
        longitude: 28.0473,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '150',
        bestRating: '5',
      },
      priceRange: '$$',
      areaServed: {
        '@type': 'Country',
        name: 'South Africa',
      },
      sameAs: [
        'https://www.facebook.com/profile.php?id=61577881601723',
        'https://www.instagram.com/aloe_signs_team',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Branding & Signage Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Billboards' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Building Wraps & XXL' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fleet Branding & Maintenance' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bulk Orders & Screen Printing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Promotional Items' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wall Art & Murals' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Set Building & Strike' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '3D Renders' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Regulatory Signs' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Site Activations' } },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://aloesigns.co.za/#website',
      url: 'https://aloesigns.co.za',
      name: 'Aloe Signs',
      publisher: { '@id': 'https://aloesigns.co.za/#business' },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <main>
        <HeroBanner />

        <ImageGrid />
        <ServicesList />
        <AboutSection />
        <ShopSpecials />

        {/* Stats Section */}
        <section className="py-20 bg-dark-grey">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-aloe-green mb-2">25+</div>
                <div className="text-light-grey">Years in Business</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-aloe-green mb-2">10 000+</div>
                <div className="text-light-grey">Projects Completed</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-aloe-green mb-2">2000+</div>
                <div className="text-light-grey">Vehicles Branded</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-aloe-green mb-2">4.9★</div>
                <div className="text-light-grey">Google Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-bg-grey">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              Ready to start your project?
            </h2>
            <p className="text-medium-grey text-lg mb-8">
              Get a free quote. No obligation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/get-quote"
                className="px-8 py-4 bg-aloe-green text-charcoal font-semibold rounded hover:bg-green-hover transition-colors text-lg"
              >
                Let&apos;s Start a project
              </a>
              <a
                href="tel:0688838049"
                className="px-8 py-4 border-2 border-charcoal text-charcoal font-semibold rounded hover:bg-charcoal hover:text-white transition-colors text-lg"
              >
                Call 068 883 8049
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
