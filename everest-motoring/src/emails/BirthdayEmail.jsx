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

const LOGO_URL = 'https://everestmotoring.co.za/images/logo.png';

const brandConfig = {
  theme: {
    extend: {
      colors: {
        primary: '#ffff01',
        'primary-dark': '#e6e600',
        secondary: '#000000',
      },
    },
  },
};

export const BirthdayEmail = ({
  customerName = 'Valued Client',
}) => {
  return (
    <Html>
      <Tailwind config={brandConfig}>
        <Head />
        <Preview>Happy Birthday from Everest Motoring! 🎂</Preview>
        <Body className="bg-neutral-100 font-sans">
          <Container className="mx-auto my-10 w-[600px] max-w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {/* Header / Logo */}
            <Section className="bg-secondary py-8 text-center border-b-4 border-primary">
              <Img src={LOGO_URL} width="170" height="auto" alt="Everest Motoring" className="mx-auto" />
            </Section>

            <Section className="px-10 pt-10 pb-4 text-center">
              <Heading className="text-3xl font-bold text-neutral-900 m-0 mb-4">
                Happy Birthday, {customerName}!
              </Heading>
              <Text className="text-neutral-600 text-lg leading-relaxed m-0">
                Wishing you a fantastic day on the road and many smooth kilometres ahead.
              </Text>
            </Section>

            {/* Celebration image */}
            <Section className="px-10 pb-6">
              <Img
                src="https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&q=80&w=800"
                width="520"
                height="auto"
                alt="Celebration"
                className="rounded-xl object-cover w-full h-auto"
              />
            </Section>

            {/* Gift card */}
            <Section className="px-10 pb-8">
              <Section className="bg-neutral-50 border-2 border-dashed border-primary-dark rounded-xl px-6 py-8 text-center">
                <Text className="text-neutral-500 font-bold text-xs uppercase tracking-[0.2em] m-0 mb-2">
                  A Special Gift for You
                </Text>
                <Heading as="h2" className="text-2xl font-bold text-neutral-900 m-0 mb-3">
                  A Complimentary Car Wash 🚗✨
                </Heading>
                <Text className="text-neutral-600 m-0 mb-6">
                  Pop in to Everest Motoring during your birthday month and we'll treat your car to a
                  complimentary wash — our way of saying thank you. Simply collect it at our showroom.
                </Text>
                <Button className="bg-primary text-black font-bold py-4 px-8 rounded-lg" href="https://everestmotoring.co.za/contact">
                  Book Your Car Wash
                </Button>
              </Section>
            </Section>

            <Section className="px-10 pb-10 text-center">
              <Text className="text-neutral-400 text-xs m-0">
                Offer valid for 30 days. Please bring your ID when visiting.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-secondary py-8 px-8 text-center">
              <Text className="text-primary font-bold text-sm m-0 mb-1">EVEREST MOTORING</Text>
              <Text className="text-neutral-400 text-sm m-0">White River, Mpumalanga</Text>
              <Text className="text-neutral-400 text-sm m-0 mt-2">013 854 0600 • info@everestmotoring.co.za</Text>
              <Text className="text-neutral-400 text-sm m-0">everestmotoring.co.za</Text>
              <Text className="text-neutral-500 text-xs mt-4 m-0">
                You are receiving this because you subscribed to our communications.
                <br />
                <Link href="#" className="text-primary underline">Unsubscribe</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BirthdayEmail;
