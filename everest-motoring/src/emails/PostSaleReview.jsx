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
} from '@react-email/components';
import * as React from 'react';

export const PostSaleReviewEmail = ({
  customerName = 'Valued Client',
  vehicleModel = 'your new vehicle',
  deliveryPhotoUrl = null,
  videoUrl = null,
  reviewUrl = 'https://www.google.com/search?q=Everest+Motoring',
}) => {
  const logoUrl = `${
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://everestmotoring.vercel.app'
  }/images/logo.png`;

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
        <Preview>How is your {vehicleModel}? Share your experience.</Preview>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 w-[600px]">
            <Section className="bg-slate py-8 text-center rounded-t-lg border-b-4 border-primary mb-10">
              <Img
                src={logoUrl}
                width="180"
                height="auto"
                alt="Everest Motoring"
                className="mx-auto"
              />
            </Section>

            <Section className="px-5 text-center">
              <Heading className="text-3xl font-bold text-slate m-0 mb-4">
                Congratulations on your new ride!
              </Heading>
              <Text className="text-slate-600 text-lg leading-relaxed mb-6">
                Hi {customerName}, it's been a few days since you drove away in your{' '}
                <strong>{vehicleModel}</strong>. We hope it's been everything you were hoping for.
              </Text>

              {videoUrl ? (
                <Section className="mb-8">
                  <Link href={videoUrl} className="no-underline">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <Img
                        src={deliveryPhotoUrl || `${logoUrl}`}
                        width="500"
                        height="auto"
                        alt="Watch your handover video"
                        className="rounded-xl mx-auto block"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(211, 47, 47, 0.92)',
                          color: '#ffffff',
                          borderRadius: '9999px',
                          width: '72px',
                          height: '72px',
                          lineHeight: '72px',
                          textAlign: 'center',
                          fontSize: '28px',
                          fontWeight: 'bold',
                        }}
                      >
                        ▶
                      </div>
                    </div>
                  </Link>
                  <Text className="text-slate-500 text-sm mt-2">
                    Click to watch your handover video
                  </Text>
                </Section>
              ) : deliveryPhotoUrl ? (
                <Section className="mb-8">
                  <Img
                    src={deliveryPhotoUrl}
                    width="500"
                    height="auto"
                    alt="Your new ride"
                    className="rounded-xl mx-auto"
                  />
                </Section>
              ) : null}

              <Text className="text-slate-600 text-lg leading-relaxed mb-8">
                If you have a moment, we'd really appreciate hearing about your experience.
                Honest reviews from clients like you help others trust us with their next vehicle.
              </Text>

              <Section className="mb-10">
                <Link
                  href={reviewUrl}
                  className="bg-primary text-white font-bold px-8 py-4 rounded-lg no-underline inline-block"
                >
                  Leave a Google Review
                </Link>
              </Section>

              <Text className="text-slate-500 italic text-sm">
                Thank you for choosing Everest Motoring.
              </Text>
            </Section>

            <Section className="bg-slate py-8 px-8 text-center rounded-b-lg mt-10">
              <Text className="text-slate-400 text-sm m-0">
                Everest Motoring | White River, Mpumalanga
              </Text>
              <Text className="text-slate-500 text-xs mt-4">
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
