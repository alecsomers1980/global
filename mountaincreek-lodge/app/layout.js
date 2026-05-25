import './globals.css';
import LayoutShell from '@/components/LayoutShell';

export const metadata = {
  title: 'Mountaincreek Lodge — Sabie River Valley self-catering luxury',
  description:
    'Mountaincreek Lodge offers a premium self-catering bush and river lodge stay in Sabie River Valley, Hazyview. Perfect for family adventures, bird watching, litchi farm visits, and Kruger Park safaris.',
  keywords: [
    'Mountaincreek Lodge',
    'Hazyview self catering',
    'Sabie River Valley accommodation',
    'Mpumalanga bush lodge',
    'family lodge South Africa',
    'Kruger Park proximity stay',
    'Red Litchi Cafe',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'Mountaincreek Lodge',
  description:
    'Mountaincreek Lodge offers a premium self-catering bush and river lodge stay in Sabie River Valley, Hazyview. Perfect for family adventures, bird watching, litchi farm visits, and Kruger Park safaris.',
  url: 'https://mountaincreeklodge.co.za',
  telephone: '+27829594643',
  email: 'info@mountaincreeklodge.co.za',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'R536 Hazyview/Sabie Road',
    addressLocality: 'Hazyview',
    addressRegion: 'Mpumalanga',
    postalCode: '1242',
    addressCountry: 'ZA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '-25.0184',
    longitude: '31.1365',
  },
  checkinTime: '14:00',
  checkoutTime: '10:00',
  priceRange: '$$',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Swimming Pool' },
    { '@type': 'LocationFeatureSpecification', name: 'Fishing Dam' },
    { '@type': 'LocationFeatureSpecification', name: 'Hiking Trails' },
    { '@type': 'LocationFeatureSpecification', name: 'Red Litchi Farm Café' },
  ],
  image: 'https://mountaincreeklodge.co.za/og-image.jpg',
  sameAs: [],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

