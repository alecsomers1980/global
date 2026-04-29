import ServicePageTemplate from '@/components/ServicePageTemplate';
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/services';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const service = getServiceBySlug(slug);
    
    if (!service) {
        return {
            title: 'Service Not Found',
        };
    }

    return {
        title: service.title,
        description: service.description,
        openGraph: {
            title: `${service.title} | Aloe Signs`,
            description: service.description,
        }
    };
}

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
