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
} from '@react-email/components';
import * as React from 'react';

export const OneMonthFollowupEmail = ({
  customerName = 'Valued Client',
  vehicleModel = 'Toyota Fortuner',
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
        <Preview>One Month with your {vehicleModel} - How is it going?</Preview>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 w-[600px]">
            {/* Header / Logo */}
            <Section className="bg-slate py-8 text-center rounded-t-lg border-b-4 border-primary mb-10">
              <Img
                src={`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://everestmotoring.vercel.app'}/images/logo.png`}
                width="180"
                height="auto"
                alt="Everest Motoring"
                className="mx-auto"
              />
            </Section>

            <Section className="px-5 text-center">
              <Heading className="text-3xl font-bold text-slate m-0 mb-4">
                One Month of Excellence
              </Heading>
              <Text className="text-slate-600 text-lg leading-relaxed">
                Hi {customerName}, it's been exactly one month since you drove away in your <strong>{vehicleModel}</strong>.
              </Text>
              <Text className="text-slate-600 text-lg leading-relaxed mb-8">
                We hope you're loving every kilometer. How has your experience been with Everest Motoring so far?
              </Text>

              {/* Star Rating Placeholder */}
              <Section className="bg-slate-50 py-8 rounded-xl border border-slate-100 mb-10">
                <Text className="font-bold text-slate uppercase tracking-wider mb-4">Rate Your Experience</Text>
                <Text className="text-3xl text-[#FFD700]">★ ★ ★ ★ ★</Text>
              </Section>

              <Row className="mb-10">
                <Column className="pr-2">
                  <Section className="bg-white border border-slate-200 p-6 rounded-lg text-center shadow-sm">
                    <Text className="font-bold text-slate m-0 mb-2">Service Center</Text>
                    <Link href="https://everestmotoring.co.za/service" className="text-primary font-bold text-sm underline">Book First Service</Link>
                  </Section>
                </Column>
                <Column className="pl-2">
                  <Section className="bg-white border border-slate-200 p-6 rounded-lg text-center shadow-sm">
                    <Text className="font-bold text-slate m-0 mb-2">Owner's Guide</Text>
                    <Link href="https://everestmotoring.co.za/guide" className="text-primary font-bold text-sm underline">View Maintenance Tips</Link>
                  </Section>
                </Column>
              </Row>

              <Text className="text-slate-500 italic text-sm">
                "Share a photo of your new ride and tag us to be featured on our social media!"
              </Text>
            </Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const Footer = () => (
            <Section className="bg-slate py-8 px-8 text-center rounded-b-lg mt-10">
              <Text className="text-slate-400 text-sm m-0">
                Everest Motoring | White River, Mpumalanga
              </Text>
              <Text className="text-slate-500 text-xs mt-4">
                You are receiving this because you subscribed to our communications.
                <br />
                <Link href="#" className="text-primary-light underline">Unsubscribe</Link>
              </Text>
            </Section>
);

export default OneMonthFollowupEmail;
