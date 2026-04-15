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

export const BirthdayEmail = ({
  customerName = 'Valued Client',
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
        <Preview>Happy Birthday from Everest Motoring! 🎂</Preview>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 w-[600px] border border-slate-100 shadow-sm rounded-2xl overflow-hidden text-center">
            {/* Header / Logo */}
            <Section className="bg-slate py-8 text-center border-b-4 border-primary mb-6">
              <Img
                src={`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://everestmotoring.vercel.app'}/images/logo.png`}
                width="180"
                height="auto"
                alt="Everest Motoring"
                className="mx-auto"
              />
            </Section>
            <Section className="py-10">
              <Heading className="text-4xl font-bold text-slate m-0 mb-4 px-10">
                HAPPY BIRTHDAY, {customerName.toUpperCase()}!
              </Heading>
              <Text className="text-slate-500 text-lg leading-relaxed mb-10 px-10">
                Wishing you a fantastic day on the road and many smooth kilometers ahead.
              </Text>

              {/* The Gift Card */}
              <Section className="mx-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 mb-10">
                <Text className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">A Special Gift for You</Text>
                <Heading as="h2" className="text-2xl font-bold text-slate m-0 mb-4">
                  Complimentary Valet or R500 Service Credit
                </Heading>
                <Text className="text-slate-600 mb-6">
                  Stop by our showroom during your birthday month to claim your gift as a token of our appreciation.
                </Text>
                <Button
                  className="bg-secondary text-white font-bold py-4 px-10 rounded-full shadow-lg"
                  href="https://everestmotoring.co.za/contact"
                >
                  Book Your Birthday Gift
                </Button>
              </Section>

              <Img
                src="https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&q=80&w=800"
                width="520"
                height="260"
                alt="Celebration"
                className="mx-auto rounded-lg mb-10"
              />

              <Text className="text-slate-400 text-xs">
                Offer valid for 30 days. Please bring your ID when visiting.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-slate py-8 px-8 text-center mt-10">
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

export default BirthdayEmail;
