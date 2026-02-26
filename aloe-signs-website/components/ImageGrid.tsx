'use client';

import Image from 'next/image';
import Link from 'next/link';

const gridImages = [
    { src: '/images/portfolio/billboards-main.jpg', alt: 'Large format billboard printing for absolute impact', label: 'Billboards' },
    { src: '/images/portfolio/vehicle-rapping-main.jpg', alt: 'Full commercial vehicle wrap branding', label: 'Vehicle Branding' },
    { src: '/images/portfolio/building-signage-main.jpg', alt: 'Building signage and shopfront design', label: 'Building Signage' },
    { src: '/images/portfolio/large-format-print-main.jpg', alt: 'Large format custom printed banners', label: 'Banners' },
    { src: '/images/portfolio/wayfinder-main.jpg', alt: 'Custom illuminated 3D business signs', label: '3D Signage' },
    { src: '/images/portfolio/print-1.jpg', alt: 'High quality commercial printing services', label: 'Large Format Print' },
    { src: '/images/portfolio/set-building-main.jpg', alt: 'Custom event and commercial set building', label: 'Set Building' },
    { src: '/images/portfolio/shop-front-main.jpg', alt: 'Commercial shopfront and retail branding', label: 'Shopfronts' },
    { src: '/images/portfolio/screen-1.jpg', alt: 'Professional commercial screen printing', label: 'Screen Printing' },
];

export default function ImageGrid() {
    return (
        <section className="py-24 bg-bg-grey relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Section Header */}
                <div className="text-center mb-16 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-charcoal uppercase tracking-tight mb-4">
                        Brands that <span className="text-aloe-green drop-shadow-sm">demand attention</span>
                    </h2>
                    <p className="text-xl text-charcoal/80 max-w-2xl mx-auto">
                        From massive billboards to fleet branding. We make your business impossible to ignore.
                    </p>
                </div>

                {/* Hexagon/Angular Grid Concept */}
                {/* CSS grid with alternating margins for a honey-comb / angular look */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                    {gridImages.map((img, idx) => (
                        <div
                            key={idx}
                            className={`relative aspect-[4/3] overflow-hidden group
                                ${idx % 3 === 1 ? 'md:translate-y-8' : ''}
                                rounded-xl md:clip-path-polygon-[10%_0,100%_0,90%_100%,0_100%]
                                transition-transform duration-500 hover:scale-105 hover:z-20`}
                            style={{
                                clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' // angular slant
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-dark-grey bg-cover bg-center" style={{ backgroundImage: `url(${img.src})` }}>
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none z-10" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <div className="w-10 h-1 bg-aloe-green mb-3"></div>
                                    <h3 className="text-white font-bold text-lg md:text-2xl uppercase">{img.label}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-20 relative z-10">
                    <Link href="/portfolio" className="inline-block border-2 border-charcoal text-charcoal hover:bg-aloe-green hover:border-aloe-green px-8 py-3 font-bold uppercase tracking-widest transition-colors">
                        View Full Portfolio
                    </Link>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aloe-green/5 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
}
