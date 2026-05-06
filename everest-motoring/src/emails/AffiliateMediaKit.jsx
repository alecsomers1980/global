import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
  Button,
} from '@react-email/components';
import * as React from 'react';

export const AffiliateMediaKit = ({
  vehicle = {
    make: 'Toyota',
    model: 'Hilux 2.8GD-6 Legend',
    year: '2024',
    videoUrl: 'https://everestmotoring.co.za/media/v123',
    trackingLink: 'https://everestmotoring.co.za/v/hilux-2024?ref=abc',
  },
  affiliateName = 'Partner',
}) => {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#d32f2f',
                secondary: '#1a237e',
                slate: '#0f1723',
                whatsapp: '#25D366',
              },
            },
          },
        }}
      >
        <Head />
        <Preview>New Media Kit: {vehicle.year} {vehicle.make} {vehicle.model}</Preview>
        <Body className="bg-slate font-sans">
          <Container className="mx-auto py-5 w-[600px]">
            {/* Header / Logo */}
            <Section className="bg-slate py-8 text-center rounded-t-lg border-b-4 border-primary">
              <Img
                src={`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://everestmotoring.vercel.app'}/images/logo.png`}
                width="180"
                height="auto"
                alt="Everest Motoring"
                className="mx-auto"
              />
              <Text className="text-primary text-xs font-bold uppercase tracking-[0.2em] mt-2">
                Affiliate Network
              </Text>
            </Section>

            {/* Notification */}
            <Section className="bg-white p-10 rounded-b-xl">
              <Heading className="text-2xl font-bold text-slate m-0 mb-4">
                Hi {affiliateName}, a new vehicle is live!
              </Heading>
              <Text className="text-slate-600 mb-8">
                Your personalized media kit for the <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> is ready. Forward this to your contacts to earn commission on the sale.
              </Text>

              {/* Video Asset Preview */}
              <Section className="bg-slate-900 rounded-lg p-0 mb-8 overflow-hidden relative border-4 border-slate-800">
                <Img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
                  width="520"
                  height="260"
                  alt="Video Preview"
                  className="w-full h-auto opacity-80"
                />
                <Section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                   <Text className="text-black font-bold bg-primary px-4 py-2 rounded shadow-lg">AI CINEMATIC VIDEO READY</Text>
                </Section>
              </Section>

              {/* Action Buttons */}
              <Row>
                <Column className="pr-2">
                  <Button
                    className="bg-whatsapp text-white font-bold py-4 px-4 rounded-lg shadow-sm text-center block w-full"
                    href={`https://wa.me/?text=Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model} at Everest Motoring! View details here: ${vehicle.trackingLink}`}
                  >
                    Share on WhatsApp
                  </Button>
                </Column>
                <Column className="pl-2">
                  <Button
                    className="bg-slate text-white font-bold py-4 px-4 rounded-lg shadow-sm text-center block w-full"
                    href={vehicle.videoUrl}
                  >
                    Download Assets
                  </Button>
                </Column>
              </Row>

              {/* Personal Link */}
              <Section className="mt-8 pt-8 border-t border-slate-100">
                <Text className="text-xs text-slate-400 uppercase font-bold mb-2">
                  Your Personalized Tracking Link:
                </Text>
                <Section className="bg-slate-50 p-3 rounded border border-slate-200">
                  <Text className="text-secondary font-mono text-sm break-all m-0">
                    {vehicle.trackingLink}
                  </Text>
                </Section>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-slate py-8 px-8 text-center rounded-b-lg">
              <Text className="text-slate-400 text-sm m-0">
                Everest Motoring | White River, Mpumalanga
              </Text>
              <Text className="text-slate-500 text-xs mt-4">
                You are receiving this because you subscribed to our communications.
                <br />
                <Link href="#" className="text-primary-light underline">Unsubscribe</Link>
              </Text>
              <Text className="text-slate-500 text-xs mt-4">
                Confidential: For affiliate partners only. Do not share raw internal links.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AffiliateMediaKit;
