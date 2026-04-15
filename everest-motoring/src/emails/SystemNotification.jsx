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
        <Preview>System Notification: {subject}</Preview>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto py-10 w-[600px]">
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
            <Section className="bg-white p-10 shadow-sm rounded-b-lg mb-8 border border-slate-100">
                <Heading className="text-2xl font-bold text-slate m-0 mb-6">
                    {subject}
                </Heading>

                <Section className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8">
                    {details.map((item, idx) => (
                        <Row key={idx} className={idx < details.length - 1 ? "border-b border-slate-200 py-3" : "py-3"}>
                            <Column className="w-1/3">
                                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider m-0">{item.label}</Text>
                            </Column>
                            <Column>
                                <Text className="text-slate-800 font-bold m-0">{item.value}</Text>
                            </Column>
                        </Row>
                    ))}
                </Section>

                <Button
                    className="bg-secondary text-white font-bold py-4 px-8 rounded shadow-md text-center block w-full"
                    href={actionLink}
                >
                    {actionLabel}
                </Button>

                <Text className="text-slate-400 text-xs mt-10">
                    This is an automated system notification. If you did not expect this alert, please contact the IT administrator.
                </Text>
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
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SystemNotificationEmail;
