'use client';

import Image from 'next/image';
import Link from 'next/link';

const gridImages = [
    { src: '/images/Billboards.jpg', alt: 'Billboards', label: 'Billboards', link: '/services/billboards' },
    { src: '/images/XXL.jpeg', alt: 'Building wraps and XXL needs', label: 'Building wraps & XXL needs', link: '/services/building-wraps' },
    { src: '/images/screen.png', alt: 'Bulk orders and screen printing', label: 'Bulk orders & screen printing', link: '/services/bulk-orders-screen-printing' },
    { src: '/images/portfolio/vehicle-rapping-main.jpg', alt: 'Fleet maintenance and branding', label: 'Fleet maintenance & branding', link: '/services/fleet-maintenance-branding' },
    { src: '/images/promo.png', alt: 'Promo Items', label: 'Promo Items', link: '/services/promo-items' },
    { src: '/images/Wall Art.jpeg', alt: 'Wall art', label: 'Wall art', link: '/services/wall-art' },
    { src: '/images/portfolio/set-building-main.jpg', alt: 'Set building & strike', label: 'Set building & strike', link: '/services/set-building-strike' },
    { src: '/images/3D.jpeg', alt: '3D Renders', label: '3D Renders', link: '/services/3d-renders' },
    { src: '/images/Tangible Visual Texture.jpeg', alt: 'Tangible Visual Texture', label: 'Tangible Visual Texture', link: '/services/tangible-visual-texture' },
    { src: '/images/safety.png', alt: 'Plant/Mines Regulatory Signs', label: 'Plant/Mines Regulatory Signs', link: '/services/regulatory-signs' },
    { src: '/images/site.png', alt: 'Site Activations', label: 'Site Activations', link: '/services/site-activations' },
];

export default function ImageGrid() {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Scroll Prompt */}
                <div className="w-full flex flex-col items-center justify-center text-center -mt-20 mb-20">
                    <div className="space-y-1 mb-4 flex flex-col items-center">
                        <p className="text-slate-400 text-xs md:text-sm font-black tracking-widest uppercase">COME ON ....</p>
                        <p className="text-slate-500 text-sm md:text-base font-black tracking-widest uppercase">GO ON....</p>
                    </div>
                    <p className="text-slate-900 text-xl md:text-2xl font-black uppercase tracking-tighter mt-2 animate-bounce flex flex-col items-center gap-3">
                        SCROLL DOWN
                        <span className="w-1 h-12 bg-gradient-to-b from-aloe-green to-transparent rounded-full mt-2" />
                    </p>
                </div>

                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
                        MAIN MONEY MAKERS
                    </h2>
                </div>

                {/* Refined Light Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridImages.map((img, idx) => (
                        <Link
                            key={idx}
                            href={img.link}
                            className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 border border-slate-200 transition-all duration-700 hover:border-aloe-green/30 shadow-xl hover:shadow-2xl block"
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                quality={90}
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
                                    VIEW SERVICES
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Removed explore the full showcase link */}
                
                {/* Outro Text */}
                <div className="mt-20 text-center">
                    <p className="text-3xl md:text-5xl font-black text-slate-800 uppercase tracking-tight">
                        We like working with <span className="text-aloe-green">LEKKER</span> people!
                    </p>
                </div>
            </div>

            {/* Subtle Ambient Glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-aloe-green/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
}

