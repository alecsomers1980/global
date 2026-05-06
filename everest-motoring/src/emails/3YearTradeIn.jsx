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

export const ThreeYearTradeInEmail = ({
  customerName = 'Valued Client',
  oldVehicle = '2021 Toyota Hilux',
  estimatedValue = 'R 485,000',
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
                silver: '#E2E8F0',
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Exclusive Upgrade Offer for your {oldVehicle}</Preview>
        <Body className="bg-slate font-sans">
          <Container className="mx-auto py-10 w-[600px]">
            {/* Header / Logo */}
            <Section className="bg-slate py-8 text-center rounded-t-lg border-b-4 border-primary mb-8">
              <Img
                src={`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://everestmotoring.vercel.app'}/images/logo.png`}
                width="180"
                height="auto"
                alt="Everest Motoring"
                className="mx-auto"
              />
              <Text className="text-silver text-xs font-bold uppercase tracking-[0.3em] mt-4">
                Executive Upgrade Program
              </Text>
            </Section>

            <Section className="bg-white p-10 rounded-xl shadow-2xl">
              <Heading className="text-2xl font-bold text-slate m-0 mb-6">
                Your {oldVehicle} is in High Demand
              </Heading>
              <Text className="text-slate-600 text-lg leading-relaxed mb-6">
                Hi {customerName}, it's been 3 years since you joined the Everest family. Based on current market trends, your vehicle currently has an <strong>exceptional trade-in value.</strong>
              </Text>

              {/* Valuation Card */}
              <Section className="bg-secondary p-8 rounded-lg text-center mb-10 border-b-4 border-primary">
                <Text className="text-silver text-sm uppercase font-bold mb-2">Estimated Market Value</Text>
                <Text className="text-white text-4xl font-bold mb-4">{estimatedValue}</Text>
                <Section className="bg-primary/20 p-2 rounded inline-block">
                    <Text className="text-primary font-bold m-0 text-sm">+ R 15,000 GUARANTEED BONUS</Text>
                </Section>
              </Section>

              <Heading as="h3" className="text-lg font-bold text-slate mb-4 uppercase">
                Recommended Upgrades
              </Heading>
              <Row className="mb-10">
                <Column className="pr-2">
                    <Section className="border border-slate-100 p-2 rounded bg-slate-50">
                        <Img src="https://images.unsplash.com/photo-1621259182978-f09e5e2ca1c5?auto=format&fit=crop&q=80&w=400" width="240" height="auto" alt="2024 Hilux" className="rounded mb-2" />
                        <Text className="font-bold text-slate text-sm m-0">2024 Toyota Hilux</Text>
                    </Section>
                </Column>
                <Column className="pl-2">
                    <Section className="border border-slate-100 p-2 rounded bg-slate-50">
                        <Img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400" width="240" height="auto" alt="2024 Fortuner" className="rounded mb-2" />
                        <Text className="font-bold text-slate text-sm m-0">2024 Toyota Fortuner</Text>
                    </Section>
                </Column>
              </Row>

              <Button
                className="bg-primary text-black font-bold py-4 px-10 rounded-lg shadow-lg block text-center w-full"
                href="https://everestmotoring.co.za/value-my-car"
              >
                Claim Your Guaranteed Valuation
              </Button>
            </Section>

            {/* Footer */}
            <Section className="bg-slate py-8 px-8 text-center rounded-b-lg mt-10">
              <Text className="text-slate-400 text-sm m-0">
                Everest Motoring | White River, Mpumalanga
              </Text>
              <Text className="text-slate-500 text-xs mt-4">
                You are receiving this because you subscribed to our communications.
                <br />
                <Link href="#" className="text-primary-light underline">Unsubscribe</Link>
              </Text>
              <Text className="text-slate-500 text-xs mt-4 italic">
                  * Valuation is an estimate based on average market condition. Final offer subject to physical inspection.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ThreeYearTradeInEmail;
