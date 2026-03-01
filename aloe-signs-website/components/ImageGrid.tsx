'use client';

import Image from 'next/image';
import Link from 'next/link';

const gridImages = [
    { src: '/images/portfolio/billboards-main.jpg', alt: 'Large format billboard printing', label: 'Billboards' },
    { src: '/images/portfolio/vehicle-rapping-main.jpg', alt: 'Full commercial vehicle wrap', label: 'Fleet Branding' },
    { src: '/images/portfolio/building-signage-main.jpg', alt: 'Building signage and shopfront design', label: 'Storefronts' },
    { src: '/images/portfolio/large-format-print-main.jpg', alt: 'Large format custom printed banners', label: 'Large Format' },
    { src: '/images/portfolio/wayfinder-main.jpg', alt: 'Custom illuminated 3D business signs', label: '3D Signage' },
    { src: '/images/portfolio/print-1.jpg', alt: 'High quality commercial printing', label: 'Specialty Print' },
    { src: '/images/portfolio/set-building-main.jpg', alt: 'Custom event and commercial set building', label: 'Set Building' },
    { src: '/images/portfolio/shop-front-main.jpg', alt: 'Commercial shopfront and retail branding', label: 'Retail Branding' },
    { src: '/images/portfolio/screen-1.jpg', alt: 'Professional commercial screen printing', label: 'Screen Print' },
];

export default function ImageGrid() {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="mb-20">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-aloe-green"></span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                            PORTFOLIO SHOWCASE
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
                        Unmissable <span className="text-aloe-green">Impact.</span>
                    </h2>
                </div>

                {/* Refined Light Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridImages.map((img, idx) => (
                        <div
                            key={idx}
                            className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 border border-slate-200 transition-all duration-700 hover:border-aloe-green/30 shadow-xl hover:shadow-2xl"
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                            />

                            {/* Soft Gradient Overlay for Readability */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10" />

                            {/* Content Over */}
                            <div className="absolute inset-0 z-20 p-10 flex flex-col justify-end">
                                <div className="w-10 h-1 bg-aloe-green mb-4 group-hover:w-20 transition-all duration-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {img.label}
                                </h3>
                                <p className="text-white/70 text-[10px] font-black tracking-widest uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    VIEW PROJECT
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 flex justify-center">
                    <Link
                        href="/portfolio"
                        className="px-12 py-5 bg-slate-900 text-white font-black rounded-full text-lg hover:bg-aloe-green hover:text-slate-900 transition-all hover:scale-105 shadow-xl shadow-slate-900/10"
                    >
                        EXPLORE THE FULL SHOWCASE
                    </Link>
                </div>
            </div>

            {/* Subtle Ambient Glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-aloe-green/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
}

