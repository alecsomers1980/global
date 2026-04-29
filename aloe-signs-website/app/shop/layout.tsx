import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Online Shop | Aloe Signs',
    description: 'Order professional signage, estate agent boards, hardware, and accessories online from Aloe Signs. Fast delivery nationwide.',
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
