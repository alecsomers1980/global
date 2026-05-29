'use client';

import Link from 'next/link';
import Image from 'next/image';

const servicesData = [
    {
        id: 'billboards',
        title: 'BILLBOARDS',
        description: 'Massive outdoor formats and high-impact advertising.',
        image: '/images/Billboards.jpg',
        link: '/services/billboards',
        alt: 'Massive outdoor billboard advertising'
    },
    {
        id: 'building-wraps',
        title: 'BUILDING WRAPS & XXL NEEDS',
        description: 'Transform your architectural space into massive visual assets.',
        image: '/images/XXL.jpeg',
        link: '/services/building-wraps',
        alt: 'Building wraps and XXL printing needs'
    },
    {
        id: 'bulk-orders',
        title: 'BULK ORDERS & SCREEN PRINTING',
        description: 'High-volume commercial screen printing for apparel, banners, and gear.',
        image: '/images/screen.png',
        link: '/services/bulk-orders-screen-printing',
        alt: 'Commercial screen printing services'
    },
    {
        id: 'fleet-maintenance',
        title: 'FLEET MAINTENANCE & BRANDING',
        description: 'Turn your fleet into moving billboards that demand attention.',
        image: '/images/portfolio/vehicle-rapping-main.jpg',
        link: '/services/fleet-maintenance-branding',
        alt: 'Commercial vehicle branding and wraps'
    },
    {
        id: 'promo-items',
        title: 'PROMO ITEMS',
        description: 'Custom promotional items that keep your brand in their hands.',
        image: '/images/promo.png',
        link: '/services/promo-items',
        alt: 'Custom promotional printing'
    },
    {
        id: 'wall-art',
        title: 'WALL ART',
        description: 'Custom internal wall art, murals, and vibrant office branding.',
        image: '/images/Wall Art.jpeg',
        link: '/services/wall-art',
        alt: 'Custom printed wall art'
    },
    {
        id: 'set-building',
        title: 'SET BUILDING & STRIKE',
        description: 'Custom set construction and scenic props for events.',
        image: '/images/portfolio/set-building-main.jpg',
        link: '/services/set-building-strike',
        alt: 'Set building and strike'
    },
    {
        id: '3d-renders',
        title: '3D RENDERS',
        description: 'Navigate your vision with stunning 3D renders before production.',
        image: '/images/3D.jpeg',
        link: '/services/3d-renders',
        alt: '3D renders and signage design'
    },
    {
        id: 'tangible-visual',
        title: 'TANGIBLE VISUAL TEXTURE',
        description: 'Premium storefront branding with unique visual textures.',
        image: '/images/Tangible Visual Texture.jpeg',
        link: '/services/tangible-visual-texture',
        alt: 'Tangible visual texture for retail'
    },
    {
        id: 'regulatory-signs',
        title: 'PLANT/MINES REGULATORY SIGNS',
        description: 'Compliant safety and regulatory signage for industrial plants and mines.',
        image: '/images/safety.png',
        link: '/services/regulatory-signs',
        alt: 'Regulatory signage for plants and mines'
    },
    {
        id: 'site-activations',
        title: 'SITE ACTIVATIONS',
        description: 'Complete site activations that leave a lasting unmissable impact.',
        image: '/images/Site.png',
        link: '/services/site-activations',
        alt: 'Event site activations'
    }
];

export default function ServicesList() {
    return (
        <section className="py-40 bg-[#0B0E0D] text-white relative flex flex-col items-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aloe-green/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-aloe-green/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 w-full">
                {/* Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {servicesData.map((service, index) => (
                        <Link
                            key={service.id}
                            href={service.link}
                            className="group relative block rounded-[2.5rem] overflow-hidden glass-card hover:border-aloe-green/40 transition-all duration-500 hover:-translate-y-4 shadow-2xl"
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={service.image}
                                    alt={service.alt}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                                    quality={90}
                                    className="object-cover absolute inset-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0D] via-[#0B0E0D]/60 to-transparent z-10" />
                            </div>

                            {/* Content */}
                            <div className="relative z-20 p-10 h-[500px] flex flex-col justify-end">
                                <div className="mb-4">
                                    <div className="w-12 h-1 bg-aloe-green mb-6 transition-all duration-500 group-hover:w-24" />
                                    <h3 className="text-3xl font-black tracking-tighter mb-4">
                                        {service.title}
                                    </h3>
                                    <p className="text-white/60 font-medium text-sm leading-relaxed mb-6 group-hover:text-white/90 transition-colors">
                                        {service.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black tracking-widest text-aloe-green group-hover:gap-5 transition-all">
                                    EXPLORE SERVICE
                                    <span className="text-xl">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

