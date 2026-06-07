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

const LOGO_URL = 'https://everestmotoring.co.za/images/logo.png';

const brandConfig = {
  theme: {
    extend: {
      colors: {
        primary: '#ffff01',
        'primary-dark': '#e6e600',
        secondary: '#000000',
        whatsapp: '#25D366',
      },
    },
  },
};

export const AffiliateMediaKit = ({
  vehicle = {
    make: 'Toyota',
    model: 'Hilux 2.8GD-6 Legend',
    year: '2024',
    price: 'R 749,900',
    mileage: '12,500 km',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    bodyType: 'Double Cab',
    colour: 'Glacier White',
    features: ['Leather seats', 'Reverse camera', 'Tow bar', 'Apple CarPlay'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    videoUrl: 'https://everestmotoring.co.za/media/v123',
    trackingLink: 'https://everestmotoring.co.za/v/hilux-2024?ref=abc',
  },
  affiliateName = 'Partner',
}) => {
  const specs = [
    { label: 'Price', value: vehicle.price },
    { label: 'Mileage', value: vehicle.mileage },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Fuel', value: vehicle.fuelType },
    { label: 'Body', value: vehicle.bodyType },
    { label: 'Colour', value: vehicle.colour },
  ].filter((s) => s.value);

  return (
    <Html>
      <Tailwind config={brandConfig}>
        <Head />
        <Preview>New Media Kit: {vehicle.year} {vehicle.make} {vehicle.model}</Preview>
        <Body className="bg-neutral-100 font-sans">
          <Container width="600" className="mx-auto my-6 w-[600px] max-w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {/* Header / Logo */}
            <Section>
              <Row>
                <Column className="bg-secondary py-[32px] text-center border-b-4 border-primary">
                  <Img src={LOGO_URL} width="170" height="auto" alt="Everest Motoring" className="mx-auto" align="center" />
                  <Text className="text-primary text-xs font-bold uppercase tracking-[0.2em] mt-3 m-0">
                    Affiliate Network
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Notification */}
            <Section>
              <Row>
                <Column className="px-[40px] pt-[40px] pb-[24px]">
                  <Heading className="text-2xl font-bold text-neutral-900 m-0 mb-3">
                    Hi {affiliateName}, a new vehicle is live!
                  </Heading>
                  <Text className="text-neutral-600 m-0">
                    Your personalised media kit for the{' '}
                    <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> is ready. Forward it
                    to your contacts to earn commission on the sale.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Vehicle image + video badge */}
            <Section>
              <Row>
                <Column className="px-[40px] pb-[24px]">
                  <Section>
                    <Row>
                      <Column className="rounded-xl border border-neutral-200">
                        <Img
                          src={vehicle.image}
                          width="520"
                          height="280"
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-auto object-cover"
                        />
                        <Row>
                          <Column className="mt-2">
                            <Text className="text-black font-bold text-xs bg-primary px-3 py-1 rounded m-0">
                              AI CINEMATIC VIDEO READY
                            </Text>
                          </Column>
                        </Row>
                      </Column>
                    </Row>
                  </Section>
                </Column>
              </Row>
            </Section>

            {/* Spec block from inventory */}
            <Section>
              <Row>
                <Column className="px-[40px] pb-[8px]">
                  <Heading as="h2" className="text-xl font-bold text-neutral-900 m-0 mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Heading>
                  <Section>
                    <Row>
                      <Column className="bg-neutral-50 border border-neutral-200 rounded-xl px-[24px] py-[8px] mt-4">
                        {[0, 2, 4].map((start) => {
                          const pair = specs.slice(start, start + 2);
                          if (pair.length === 0) return null;
                          return (
                            <Row key={start} className={start < 4 ? 'border-b border-neutral-200' : ''}>
                              {pair.map((s) => (
                                <Column key={s.label} className="w-1/2 py-3 align-top">
                                  <Text className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider m-0">
                                    {s.label}
                                  </Text>
                                  <Text className="text-neutral-900 font-bold text-sm m-0">{s.value}</Text>
                                </Column>
                              ))}
                            </Row>
                          );
                        })}
                      </Column>
                    </Row>
                  </Section>

                  {vehicle.features && vehicle.features.length > 0 && (
                    <Text className="text-neutral-600 text-sm mt-4 m-0">
                      <strong className="text-neutral-900">Key features:</strong>{' '}
                      {vehicle.features.slice(0, 6).join(' • ')}
                    </Text>
                  )}
                </Column>
              </Row>
            </Section>

            {/* Action Buttons */}
            <Section>
              <Row>
                <Column className="px-[40px] py-[24px]">
                  <Row>
                    <Column className="w-1/2 pr-2">
                      <Button
                        className="bg-whatsapp text-white font-bold py-3 px-2 rounded-lg text-center w-full"
                        href={`https://wa.me/?text=Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model} at Everest Motoring! ${vehicle.trackingLink}`}
                      >
                        Share on WhatsApp
                      </Button>
                    </Column>
                    <Column className="w-1/2 pl-2">
                      <Button
                        className="bg-secondary text-primary font-bold py-3 px-2 rounded-lg text-center w-full"
                        href={vehicle.videoUrl}
                      >
                        Download Assets
                      </Button>
                    </Column>
                  </Row>
                </Column>
              </Row>
            </Section>

            {/* Personal Link */}
            <Section>
              <Row>
                <Column className="px-[40px] pb-[40px]">
                  <Text className="text-xs text-neutral-400 uppercase font-bold mb-2 m-0">
                    Your personalised tracking link
                  </Text>
                  <Section>
                    <Row>
                      <Column className="bg-neutral-50 border border-neutral-200 rounded-lg px-[16px] py-[12px]">
                        <Text className="text-neutral-900 font-mono text-xs break-all m-0">
                          {vehicle.trackingLink}
                        </Text>
                      </Column>
                    </Row>
                  </Section>
                </Column>
              </Row>
            </Section>

            {/* Footer */}
            <Section>
              <Row>
                <Column className="bg-secondary py-[32px] px-[32px] text-center">
                  <Text className="text-primary font-bold text-sm m-0 mb-1">EVEREST MOTORING</Text>
                  <Text className="text-neutral-400 text-sm m-0">White River, Mpumalanga</Text>
                  <Text className="text-neutral-400 text-sm m-0 mt-2">013 854 0600 • info@everestmotoring.co.za</Text>
                  <Text className="text-neutral-400 text-sm m-0">everestmotoring.co.za</Text>
                  <Text className="text-neutral-500 text-xs mt-4 m-0">
                    Confidential: for affiliate partners only. Do not share raw internal links.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AffiliateMediaKit;
