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

export const PostSaleReviewEmail = ({
  customerName = 'Valued Client',
  vehicleModel = 'your new vehicle',
  carImageUrl = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  deliveryPhotoUrl = null,
  videoUrl = 'https://everestmotoring.co.za/media/celebration',
  reviewUrl = 'https://www.google.com/search?q=Everest+Motoring',
}) => {
  // Thumbnail for the celebration video: prefer the handover photo, then the
  // inventory car image.
  const videoThumb = deliveryPhotoUrl || carImageUrl;

  return (
    <Html>
      <Tailwind config={brandConfig}>
        <Head />
        <Preview>Congratulations on your {vehicleModel}!</Preview>
        <Body className="bg-neutral-100 font-sans">
          <Container className="mx-auto my-10 w-[600px] max-w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {/* Header / Logo */}
            <Section className="bg-secondary py-8 text-center border-b-4 border-primary">
              <Img src={LOGO_URL} width="170" height="auto" alt="Everest Motoring" className="mx-auto" />
            </Section>

            <Section className="px-10 pt-10 pb-6 text-center">
              <Heading className="text-3xl font-bold text-neutral-900 m-0 mb-4">
                Congratulations on your new ride!
              </Heading>
              <Text className="text-neutral-600 text-lg leading-relaxed m-0">
                Hi {customerName}, we hope your <strong>{vehicleModel}</strong> has been everything
                you were hoping for.
              </Text>
            </Section>

            {/* Inventory car image */}
            {carImageUrl && (
              <Section className="px-10 pb-6">
                <Img
                  src={carImageUrl}
                  width="520"
                  height="auto"
                  alt={vehicleModel}
                  className="rounded-xl object-cover w-full h-auto"
                />
              </Section>
            )}

            {/* Celebration video created when the car was marked sold */}
            {videoUrl && (
              <Section className="px-10 pb-6 text-center">
                <Link href={videoUrl} className="no-underline">
                  <Section className="relative rounded-xl overflow-hidden border border-neutral-200">
                    {videoThumb && (
                      <Img
                        src={videoThumb}
                        width="520"
                        height="auto"
                        alt="Watch your celebration video"
                        className="w-full h-auto object-cover opacity-90"
                      />
                    )}
                    <Section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Text className="bg-primary text-black font-bold rounded-full m-0" style={{ width: '64px', height: '64px', lineHeight: '64px', textAlign: 'center', fontSize: '24px' }}>
                        ▶
                      </Text>
                    </Section>
                  </Section>
                </Link>
                <Text className="text-neutral-500 text-sm mt-2 m-0">
                  🎉 Tap to watch your celebration video
                </Text>
              </Section>
            )}

            <Section className="px-10 pb-2 text-center">
              <Text className="text-neutral-600 text-lg leading-relaxed mb-6">
                If you have a moment, we'd really appreciate hearing about your experience. Honest
                reviews from clients like you help others trust us with their next vehicle.
              </Text>
              <Section className="text-center mb-6">
                <Button className="bg-primary text-black font-bold py-4 px-8 rounded-lg" href={reviewUrl}>
                  Leave a Google Review
                </Button>
              </Section>
              <Text className="text-neutral-500 italic text-sm m-0">
                Thank you for choosing Everest Motoring.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-secondary py-8 px-8 text-center mt-6">
              <Text className="text-primary font-bold text-sm m-0 mb-1">EVEREST MOTORING</Text>
              <Text className="text-neutral-400 text-sm m-0">White River, Mpumalanga</Text>
              <Text className="text-neutral-400 text-sm m-0 mt-2">013 854 0600 • info@everestmotoring.co.za</Text>
              <Text className="text-neutral-400 text-sm m-0">everestmotoring.co.za</Text>
              <Text className="text-neutral-500 text-xs mt-4 m-0">
                You are receiving this because you recently purchased a vehicle from us.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PostSaleReviewEmail;
