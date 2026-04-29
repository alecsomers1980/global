import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Portfolio | Aloe Signs',
    description: 'Explore our latest signage, branding, and printing projects. See how we help businesses stand out with unmissable visual solutions.',
};

export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
