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
      },
    },
  },
};

export const SystemNotificationEmail = ({
  subject = 'New Lead Received',
  details = [
    { label: 'Reference No', value: 'EV-9821' },
    { label: 'Action Source', value: 'Finance Calculator' },
    { label: 'Status', value: 'Priority' },
  ],
  actionLink = 'https://everestmotoring.co.za/admin/leads',
  actionLabel = 'Log in to Admin Hub',
}) => {
  return (
    <Html>
      <Tailwind config={brandConfig}>
        <Head />
        <Preview>System Notification: {subject}</Preview>
        <Body className="bg-neutral-100 font-sans">
          <Container width="600" className="mx-auto my-10 w-[600px] max-w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {/* Header / Logo */}
            <Section className="bg-secondary py-8 text-center border-b-4 border-primary">
              <Img src={LOGO_URL} width="170" height="auto" alt="Everest Motoring" className="mx-auto" />
              <Text className="text-primary text-xs font-bold uppercase tracking-[0.2em] mt-3 m-0">
                Internal Notification
              </Text>
            </Section>

            <Section className="px-10 py-10">
              <Heading className="text-2xl font-bold text-neutral-900 m-0 mb-6">{subject}</Heading>

              <Section className="bg-neutral-50 border border-neutral-200 rounded-xl px-6 py-2 mb-8">
                {details.map((item, idx) => (
                  <Row key={idx} className={idx < details.length - 1 ? 'border-b border-neutral-200' : ''}>
                    <Column className="w-2/5 py-3 align-top">
                      <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wider m-0">
                        {item.label}
                      </Text>
                    </Column>
                    <Column className="py-3 align-top">
                      <Text className="text-neutral-900 font-bold m-0">{item.value}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>

              <Section className="text-center">
                <Button className="bg-primary text-black font-bold py-4 px-8 rounded-lg" href={actionLink}>
                  {actionLabel}
                </Button>
              </Section>

              <Text className="text-neutral-400 text-xs mt-10 m-0">
                This is an automated system notification. If you did not expect this alert, please
                contact the administrator.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-secondary py-8 px-8 text-center">
              <Text className="text-primary font-bold text-sm m-0 mb-1">EVEREST MOTORING</Text>
              <Text className="text-neutral-400 text-sm m-0">White River, Mpumalanga</Text>
              <Text className="text-neutral-400 text-sm m-0 mt-2">013 854 0600 • info@everestmotoring.co.za</Text>
              <Text className="text-neutral-400 text-sm m-0">everestmotoring.co.za</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SystemNotificationEmail;
