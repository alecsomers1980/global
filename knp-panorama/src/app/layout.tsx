import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import './globals.css';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-josefin',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.knp-panorama.com'),
  title: {
    default: 'Kruger Panorama Experience | Safaris & Tours in Mpumalanga',
    template: '%s | Kruger Panorama Experience',
  },
  description:
    'Community-driven safaris, Panorama Route tours, transfers and accommodation in the Mpumalanga Lowveld, with local guides born and raised in the area.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={josefin.variable}>
      <body>{children}</body>
    </html>
  );
}
