import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get a Quote | Aloe Signs',
    description: 'Request a free, no-obligation quote for your next signage or branding project. We provide detailed proposals and competitive pricing.',
};

export default function GetQuoteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
