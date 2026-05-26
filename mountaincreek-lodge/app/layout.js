import './globals.css';
import LayoutShell from '@/components/LayoutShell';

export const metadata = {
  metadataBase: new URL('https://mountaincreeklodge.vercel.app'),
  title: {
    default: 'Mountaincreek Lodge — Sabie River Valley Luxury',
    template: '%s | Mountaincreek Lodge'
  },
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
  openGraph: {
    title: 'Mountaincreek Lodge — Luxury Lowveld Stays',
    description: 'Experience premium self-catering escapes near Kruger National Park.',
    url: 'https://mountaincreeklodge.vercel.app',
    siteName: 'Mountaincreek Lodge',
    images: [
      {
        url: '/images/accommodation/IMG_8185.jpg',
        width: 1200,
        height: 630,
        alt: 'Mountaincreek Lodge Hero',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mountaincreek Lodge — Luxury Lowveld Stays',
    description: 'Experience premium self-catering escapes near Kruger National Park.',
    images: ['/images/accommodation/IMG_8185.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LodgingBusiness', 'Resort'],
  name: 'Mountaincreek Lodge',
  description:
    'Mountaincreek Lodge offers a premium self-catering bush and river lodge stay in Sabie River Valley, Hazyview. Perfect for family adventures, bird watching, litchi farm visits, and Kruger Park safaris.',
  url: 'https://mountaincreeklodge.vercel.app',
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
  hasMap: 'https://maps.google.com/?cid=1234567890', // Example link, update if needed
  checkinTime: '14:00',
  checkoutTime: '10:00',
  priceRange: 'ZAR 1500 - ZAR 4500',
  starRating: {
    '@type': 'Rating',
    ratingValue: '4'
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Swimming Pool', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Fishing Dam', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Hiking Trails', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Red Litchi Farm Café', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free Wi-Fi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Secure Parking', value: true },
  ],
  image: 'https://mountaincreeklodge.vercel.app/images/accommodation/IMG_8185.jpg',
  sameAs: [
    'https://www.facebook.com/MountainCreekLodgeHazyview', // Add social links if available
    'https://www.instagram.com/mountaincreeklodge'
  ],
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

