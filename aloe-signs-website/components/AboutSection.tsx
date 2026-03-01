'use client';

import Link from 'next/link';

const actionImages = [
    { src: '/images/portfolio/interior-1.jpg', alt: 'Aloe Signs team installing a large billboard on site' },
    { src: '/images/portfolio/interior-2.jpg', alt: 'Graphic designer formatting a wide banner for print' },
    { src: '/images/portfolio/vehicle-1.jpg', alt: 'Team members applying a vinyl wrap to a commercial vehicle' },
];

export default function AboutSection() {
    return (
        <section className="py-32 bg-bg-grey text-charcoal">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Top Section - Story & Owner */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-32 items-center">

                    {/* Owner Image Side */}
                    <div className="w-full lg:w-5/12 relative">
                        {/* Decorative background shape */}
                        <div className="absolute top-8 -left-8 w-full h-full bg-aloe-green -z-10 rounded-[2.5rem]" />
                        <div className="relative aspect-[3/4] bg-dark-grey overflow-hidden shadow-2xl rounded-[2.5rem]">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-90 mix-blend-luminosity"
                                style={{ backgroundImage: `url('/images/portfolio/building-signage-main.jpg')` }}
                                title="Aloe Signs Headquarters"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 to-transparent p-8">
                                <p className="text-white font-black text-2xl uppercase tracking-wider">Our Foundation</p>
                                <p className="text-aloe-green font-bold uppercase text-sm tracking-widest">Randfontein Headquarters</p>
                            </div>
                        </div>
                    </div>

                    {/* Story Content Side */}
                    <div className="w-full lg:w-7/12">
                        <h2 className="text-sm md:text-base text-aloe-green font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-4">
                            <span className="w-12 h-1 bg-aloe-green block"></span>
                            How It Started
                        </h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8 leading-tight text-charcoal">
                            Built from the ground up to <span className="bg-charcoal text-white px-1">dominate.</span>
                        </h3>

                        <div className="space-y-6 text-xl text-charcoal/80 font-medium">
                            <p>
                                Aloe Signs was built from a single garage by a husband and wife team with a stubborn belief: that businesses shouldn't have to choose between quality signage and affordable prices.
                            </p>
                            <p>
                                What started as a small operation cutting vinyl by hand has exploded into a full-scale manufacturing powerhouse in Randfontein.
                            </p>
                            <p>
                                We grew because we respected the hustle. Today, we handle the entire process under one roof—from the initial raw concept to the final, sweat-inducing installation. Branding is a physical asset, and we build it to dominate.
                            </p>
                        </div>

                        <div className="mt-12">
                            <Link
                                href="/about"
                                className="inline-flex items-center gap-4 font-bold text-lg uppercase tracking-widest text-charcoal hover:text-aloe-green transition-colors group"
                            >
                                <span className="w-12 h-1 bg-charcoal block transition-all group-hover:w-24 group-hover:bg-aloe-green"></span>
                                Read Our Full Story
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Bottom Section - Team in Action Grid */}
                <div>
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-charcoal">
                            We don't just design it. <br /> <span className="text-aloe-green drop-shadow-sm">We build it.</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {actionImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square overflow-hidden group rounded-[2.5rem] shadow-lg">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${img.src})` }}
                                    title={img.alt}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
