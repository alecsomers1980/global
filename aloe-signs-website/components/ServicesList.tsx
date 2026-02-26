'use client';

import Link from 'next/link';

const servicesData = [
    {
        id: 'signage',
        title: 'SIGNAGE & BILLBOARDS',
        description: 'High-impact outdoor branding that stops traffic.',
        image: '/images/portfolio/billboards-main.jpg',
        link: '/services/building-signage',
        alt: 'Billboard signage for retail brand in South Africa'
    },
    {
        id: 'printing',
        title: 'LARGE FORMAT PRINTING',
        description: 'Massive banners, posters & digital prints — crystal clear at any scale.',
        image: '/images/portfolio/large-format-print-main.jpg',
        link: '/services/large-format-print',
        alt: 'Large format banner printing for commercial use'
    },
    {
        id: 'branding',
        title: 'VEHICLE BRANDING',
        description: 'Turn your fleet into moving billboards that demand attention.',
        image: '/images/portfolio/vehicle-rapping-main.jpg',
        link: '/services/vehicle-branding',
        alt: 'Complete commercial vehicle branding wrap'
    }
];

export default function ServicesList() {
    return (
        <section className="py-32 bg-charcoal text-white relative">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Intro */}
                <div className="mb-24 md:w-2/3">
                    <h2 className="text-sm md:text-base text-aloe-green font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-4">
                        <span className="w-12 h-1 bg-aloe-green block"></span>
                        Our Core Capabilities
                    </h2>
                    <p className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                        We build brands that work <span className="text-aloe-green">as hard as you do.</span>
                    </p>
                </div>

                {/* Vertical Service List */}
                <div className="flex flex-col gap-32">
                    {servicesData.map((service, index) => (
                        <div
                            key={service.id}
                            className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24 group`}
                        >
                            {/* Image Side */}
                            <div className="w-full md:w-1/2 relative">
                                <Link href={service.link} className="block relative aspect-[4/3] overflow-hidden">
                                    <div className="absolute inset-0 bg-dark-grey transition-transform duration-700 group-hover:scale-105">
                                        {/* Simulated Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500"
                                            style={{ backgroundImage: `url(${service.image})` }}
                                            title={service.alt}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                                    </div>

                                    {/* Decorative accent */}
                                    {index % 2 === 0 ? (
                                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-aloe-green -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
                                    ) : (
                                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-aloe-green -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                    )}
                                </Link>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 space-y-6">
                                <h3 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white">
                                    {service.title}
                                </h3>
                                <p className="text-2xl text-white/80 font-medium">
                                    {service.description}
                                </p>
                                <div className="pt-8">
                                    <Link
                                        href={service.link}
                                        className="inline-flex items-center gap-4 text-aloe-green font-bold text-xl uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        <span className="w-12 h-1 bg-aloe-green block transition-all group-hover:w-24 group-hover:bg-white"></span>
                                        Explore Service
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
