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
  Button,
} from '@react-email/components';
import * as React from 'react';

export const WelcomeEmail = ({
  customerName = 'Valued Customer',
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
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Welcome to the Everest Motoring Family</Preview>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 w-[600px] border border-slate-100 shadow-sm rounded-xl">
            {/* Header / Logo */}
            <Section className="bg-slate py-8 text-center rounded-t-lg border-b-4 border-primary">
              <Img
                src={`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://everestmotoring.vercel.app'}/images/logo.png`}
                width="180"
                height="auto"
                alt="Everest Motoring"
                className="mx-auto"
              />
            </Section>

            {/* Content */}
            <Section className="px-10 text-center">
              <Heading className="text-3xl font-bold text-slate m-0 mb-6">
                Welcome to the Family, {customerName}!
              </Heading>
              <Text className="text-slate-600 text-lg leading-relaxed mb-8">
                Thank you for choosing Everest Motoring. We're honored to assist you in finding your next premium vehicle. 
                Our team is dedicated to providing you with the highest quality service and a seamless buying experience.
              </Text>

              {/* USP Icons/Grid */}
              <Section className="bg-slate-50 p-6 rounded-lg mb-8 text-left">
                <Text className="font-bold text-slate mb-2 flex items-center">
                  ✅ Premium Inspection on all vehicles
                </Text>
                <Text className="font-bold text-slate mb-2">
                  ✅ Transparent Finance Options
                </Text>
                <Text className="font-bold text-slate">
                  ✅ AI-Driven Digital Showroom
                </Text>
              </Section>

              <Button
                className="bg-secondary text-white font-bold py-4 px-10 rounded-full shadow-lg"
                href="https://everestmotoring.co.za/inventory"
              >
                Browse Our Current Showroom
              </Button>
            </Section>

            {/* Footer */}
            <Section className="bg-slate py-8 px-8 text-center rounded-b-lg mt-8">
              <Text className="text-slate-400 text-sm m-0">
                Everest Motoring | White River, Mpumalanga
              </Text>
              <Text className="text-slate-500 text-xs mt-4">
                You are receiving this because you subscribed to our communications.
                <br />
                <Link href="#" className="text-primary-light underline">Unsubscribe</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
