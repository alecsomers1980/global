import ServicePageTemplate from '@/components/ServicePageTemplate';
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/services';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const slugs = getAllServiceSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const service = getServiceBySlug(slug);

    if (!service) {
        notFound();
    }

    return <ServicePageTemplate service={service} />;
}
