'use client';

import Link from 'next/link';
import Image from 'next/image';

const servicesData = [
    {
        id: 'vehicle-branding',
        title: 'VEHICLE BRANDING',
        description: 'Turn your fleet into moving billboards that demand attention and drive brand awareness.',
        image: '/images/portfolio/vehicle-rapping-main.jpg',
        link: '/services/vehicle-branding',
        alt: 'High-impact commercial vehicle branding and wraps'
    },
    {
        id: 'signage',
        title: 'BUILDING SIGNAGE',
        description: 'Elevate your physical presence with high-visibility exterior and architectural signage.',
        image: '/images/portfolio/building-signage-main.jpg',
        link: '/services/building-signage',
        alt: 'Professional building signage for commercial retail'
    },
    {
        id: 'shopfronts',
        title: 'SHOPFRONTS',
        description: 'Create a stunning first impression with modern retail branding and storefront solutions.',
        image: '/images/portfolio/shop-front-main.jpg',
        link: '/services/shopfronts',
        alt: 'Premium shopfront branding and retail design'
    },
    {
        id: 'wayfinding',
        title: 'WAYFINDING & INTERIOR',
        description: 'Navigate your space with clarity using custom internal signage and 3D wayfinding systems.',
        image: '/images/portfolio/wayfinder-main.jpg',
        link: '/services/wayfinding-interior',
        alt: 'Custom interior wayfinding and office signage'
    },
    {
        id: 'billboards',
        title: 'BILLBOARDS & OUTDOOR',
        description: 'Dominate the landscape with massive outdoor formats and high-impact billboard advertising.',
        image: '/images/portfolio/billboards-main.jpg',
        link: '/services/billboards-outdoor',
        alt: 'Massive outdoor billboard advertising in South Africa'
    },
    {
        id: 'large-format',
        title: 'LARGE FORMAT PRINT',
        description: 'Crystal-clear digital printing at any scale, from massive banners to custom wall murals.',
        image: '/images/portfolio/large-format-print-main.jpg',
        link: '/services/large-format-print',
        alt: 'High-quality large format digital printing'
    },
    {
        id: 'screen-printing',
        title: 'SCREEN PRINTING',
        description: 'Professional high-volume commercial screen printing for apparel, banners, and promotional gear.',
        image: '/images/portfolio/screen-1.jpg',
        link: '/services/screen-printing',
        alt: 'Commercial screen printing services'
    },
    {
        id: 'set-building',
        title: 'SET BUILDING & PROPS',
        description: 'Bringing creative visions to life with custom set construction and scenic props for events.',
        image: '/images/portfolio/set-building-main.jpg',
        link: '/services/set-building',
        alt: 'Custom set building and prop design services'
    }
];

export default function ServicesList() {
    return (
        <section className="py-40 bg-[#0B0E0D] text-white relative flex flex-col items-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aloe-green/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-aloe-green/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 w-full">
                {/* Intro Section */}
                <div className="mb-32 max-w-4xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-aloe-green"></span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">
                            CORE CAPABILITIES
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10">
                        WE BUILD BRANDS THAT<br />
                        <span className="text-aloe-green">COMMAND ATTENTION.</span>
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-white/50 max-w-2xl leading-relaxed">
                        Precision engineering meets artistic vision. We deliver high-impact branding solutions that transform your business visibility.
                    </p>
                </div>

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
                                <div
                                    className="absolute inset-0 bg-cover bg-center grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700"
                                    style={{ backgroundImage: `url(${service.image})` }}
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

