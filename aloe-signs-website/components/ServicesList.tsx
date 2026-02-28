'use client';

import Link from 'next/link';
import Image from 'next/image';

const servicesData = [
    {
        id: 'signage',
        title: 'SIGNAGE & BILLBOARDS',
        description: 'High-impact outdoor branding that stops traffic and demands attention across South Africa.',
        image: '/images/portfolio/billboards-main.jpg',
        link: '/services/building-signage',
        alt: 'Billboard signage for retail brand in South Africa'
    },
    {
        id: 'printing',
        title: 'LARGE FORMAT PRINTING',
        description: 'Massive banners, posters & digital prints — crystal clear at any scale, built for durability.',
        image: '/images/portfolio/large-format-print-main.jpg',
        link: '/services/large-format-print',
        alt: 'Large format banner printing for commercial use'
    },
    {
        id: 'branding',
        title: 'VEHICLE BRANDING',
        description: 'Turn your fleet into moving billboards that demand attention and drive brand awareness.',
        image: '/images/portfolio/vehicle-rapping-main.jpg',
        link: '/services/vehicle-branding',
        alt: 'Complete commercial vehicle branding wrap'
    }
];

export default function ServicesList() {
    return (
        <section className="py-40 bg-[#0B0E0D] text-white relative flex flex-col items-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-vibrant-emerald/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-vibrant-emerald/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 w-full">
                {/* Intro Section */}
                <div className="mb-32 max-w-4xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-vibrant-emerald"></span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">
                            CORE CAPABILITIES
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10">
                        WE BUILD BRANDS THAT<br />
                        <span className="text-vibrant-emerald">COMMAND ATTENTION.</span>
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
                            className="group relative block rounded-[2.5rem] overflow-hidden glass-card hover:border-vibrant-emerald/40 transition-all duration-500 hover:-translate-y-4 shadow-2xl"
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
                                    <div className="w-12 h-1 bg-vibrant-emerald mb-6 transition-all duration-500 group-hover:w-24" />
                                    <h3 className="text-3xl font-black tracking-tighter mb-4">
                                        {service.title}
                                    </h3>
                                    <p className="text-white/60 font-medium text-sm leading-relaxed mb-6 group-hover:text-white/90 transition-colors">
                                        {service.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black tracking-widest text-vibrant-emerald group-hover:gap-5 transition-all">
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

