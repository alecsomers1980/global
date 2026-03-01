import Link from 'next/link';
import Header from '@/components/Header';
import StatsSection from '@/components/StatsSection';
import { Building2, Users, Award, MapPin, CheckCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main>
                {/* Hero Section */}
                <div className="relative bg-charcoal text-white py-20 md:py-32">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-2 text-sm text-light-grey mb-6">
                                <Link href="/" className="hover:text-aloe-green transition-colors">
                                    Home
                                </Link>
                                <span>/</span>
                                <span className="text-white font-bold">About Us</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                                About Aloe Signs
                            </h1>

                            <p className="text-2xl md:text-3xl text-aloe-green font-semibold mb-6">
                                Products that builds businesses
                            </p>

                            <p className="text-lg md:text-xl text-light-grey">
                                For over 25 years, we&apos;ve been helping South African businesses stand out with
                                professional signage and branding solutions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Founding Story Section */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div className="relative aspect-square md:aspect-[4/5] bg-bg-grey rounded-[2.5rem] overflow-hidden shadow-xl">
                                <div
                                    className="absolute inset-0 bg-cover bg-center grayscale contrast-125"
                                    style={{ backgroundImage: `url('/images/portfolio/shopfront-1.jpg')` }}
                                    title="Aloe Signs founders"
                                />
                                <div className="absolute inset-0 bg-aloe-green/10 mix-blend-overlay"></div>
                            </div>

                            <div>
                                <h2 className="text-sm md:text-base text-aloe-green font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-4">
                                    <span className="w-12 h-1 bg-aloe-green block"></span>
                                    Our Roots
                                </h2>
                                <h3 className="text-4xl md:text-5xl font-black text-charcoal mb-8 uppercase tracking-tight leading-tight">
                                    Built on grit <br /> and late nights.
                                </h3>
                                <div className="space-y-6 text-xl text-medium-grey font-medium">
                                    <p>
                                        [PLACEHOLDER STORY] Aloe Signs wasn't born in a sterile corporate office. It was started decades ago by my father and mother, working out of a small garage with nothing but a vinyl cutter and an absolute refusal to fail.
                                    </p>
                                    <p>
                                        [PLACEHOLDER STORY] They spent their days knocking on factory doors in Randfontein and their nights hand-weeding vinyl on the kitchen table. They believed that South African businesses deserved signage that was built tough, priced fairly, and delivered on time.
                                    </p>
                                    <p>
                                        [PLACEHOLDER STORY] That same relentless work ethic is still the backbone of our operation today. From a single garage to a full-scale manufacturing facility, the values haven't changed: do the job right, or don't do it at all.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Owner Section */}
                <section className="py-16 md:py-24 bg-white text-charcoal border-y border-border-grey">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center md:flex-row-reverse">

                            <div className="order-2 md:order-1">
                                <h2 className="text-sm md:text-base text-aloe-green font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-4">
                                    <span className="w-12 h-1 bg-aloe-green block"></span>
                                    The Next Chapter
                                </h2>
                                <h3 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight leading-tight">
                                    Andre de Bod
                                    <span className="block text-2xl text-aloe-green mt-2">Owner & Managing Director</span>
                                </h3>
                                <div className="space-y-6 text-xl text-charcoal/80 font-medium mb-10">
                                    <p>
                                        [PLACEHOLDER HISTORY] Growing up in the signage industry meant I learned how to mix ink before I learned how to drive. Taking over Aloe Signs wasn't just a business decision; it was about honoring a legacy while aggressively pushing it into the modern era.
                                    </p>
                                    <p>
                                        [PLACEHOLDER HISTORY] Under my leadership, we've expanded our capabilities to include massive large-format printing, digital displays, and comprehensive fleet branding. We don't just make signs anymore—we engineer unmissable visual assets.
                                    </p>
                                </div>

                                {/* Quote */}
                                <blockquote className="border-l-4 border-aloe-green pl-6 py-2">
                                    <p className="text-2xl md:text-3xl font-bold italic text-charcoal mb-4">
                                        "A brand is useless if no one can see it. We don't build quiet signs for quiet businesses. We build to dominate."
                                    </p>
                                </blockquote>
                            </div>

                            <div className="order-1 md:order-2 relative aspect-[3/4] bg-dark-grey rounded-[2.5rem] overflow-hidden shadow-2xl">
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-90 mix-blend-luminosity"
                                    style={{ backgroundImage: `url('/images/portfolio/shop-front-1.jpg')` }}
                                    title="Andre de Bod"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal to-transparent h-1/2"></div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* The Team Section */}
                <section className="py-16 md:py-24 bg-bg-grey">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-sm md:text-base text-aloe-green font-bold tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-4">
                                <span className="w-8 h-1 bg-aloe-green block"></span>
                                The Muscle
                                <span className="w-8 h-1 bg-aloe-green block"></span>
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-black text-charcoal uppercase tracking-tight">
                                Meet the Crew
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Designers */}
                            <div className="group">
                                <div className="relative aspect-square bg-dark-grey mb-6 overflow-hidden rounded-[2.5rem] shadow-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('/images/portfolio/interior-2.jpg')` }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                                </div>
                                <h4 className="text-2xl font-black text-charcoal uppercase tracking-wide">[Staff Name]</h4>
                                <p className="text-aloe-green font-bold uppercase tracking-wider text-sm mb-2">Lead Designer</p>
                                <p className="text-medium-grey">The creative brain turning your wild ideas into print-ready blueprints.</p>
                            </div>

                            {/* Construction */}
                            <div className="group">
                                <div className="relative aspect-square bg-dark-grey mb-6 overflow-hidden rounded-[2.5rem] shadow-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('/images/portfolio/set-building-main.jpg')` }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                                </div>
                                <h4 className="text-2xl font-black text-charcoal uppercase tracking-wide">[Staff Name]</h4>
                                <p className="text-aloe-green font-bold uppercase tracking-wider text-sm mb-2">Construction & Manufacturing</p>
                                <p className="text-medium-grey">Operating the heavy machinery that builds the physical structures.</p>
                            </div>

                            {/* Setup */}
                            <div className="group">
                                <div className="relative aspect-square bg-dark-grey mb-6 overflow-hidden rounded-[2.5rem] shadow-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('/images/portfolio/interior-1.jpg')` }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                                </div>
                                <h4 className="text-2xl font-black text-charcoal uppercase tracking-wide">[Staff Name]</h4>
                                <p className="text-aloe-green font-bold uppercase tracking-wider text-sm mb-2">Setup & Installation</p>
                                <p className="text-medium-grey">The boots on the ground making sure the sign survives any weather.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <StatsSection />

                {/* What Makes Us Different */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                                What Makes Us Different
                            </h2>
                            <p className="text-lg text-medium-grey max-w-2xl mx-auto">
                                End-to-end service with in-house capabilities
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: Building2,
                                    title: 'In-House Manufacturing',
                                    description: 'Our own production facility means quality control and faster turnaround times.',
                                },
                                {
                                    icon: Users,
                                    title: 'Own Installation Team',
                                    description: 'Certified installers who understand our products and your expectations.',
                                },
                                {
                                    icon: Award,
                                    title: 'End-to-End Service',
                                    description: 'From design to installation, your project stays with our team.',
                                },
                                {
                                    icon: MapPin,
                                    title: 'Nationwide Coverage',
                                    description: 'Based in Gauteng, serving businesses across South Africa.',
                                },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="bg-bg-grey p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-aloe-green rounded-lg flex items-center justify-center mb-4">
                                            <Icon className="w-6 h-6 text-charcoal" />
                                        </div>
                                        <h3 className="text-xl font-bold text-charcoal mb-2">{item.title}</h3>
                                        <p className="text-medium-grey">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Location & Coverage */}
                <section className="py-16 md:py-20 bg-bg-grey">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-6">
                                    Location & Coverage
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-charcoal mb-2">Our Workshop</h3>
                                        <p className="text-medium-grey">
                                            42 Homestead Ave, Randfontein, Gauteng
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-charcoal mb-2">Service Area</h3>
                                        <p className="text-medium-grey">
                                            Based in Gauteng, we serve businesses across all of South Africa with
                                            nationwide installation services.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-charcoal mb-2">Business Hours</h3>
                                        <p className="text-medium-grey">
                                            Monday - Friday: 8:00 AM - 5:00 PM<br />
                                            Saturday: 8:00 AM - 1:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-border-grey">
                                <h3 className="text-2xl font-bold text-charcoal mb-4">
                                    Ready to work with us?
                                </h3>
                                <p className="text-medium-grey mb-6">
                                    Get in touch to discuss your signage project. We&apos;ll provide a free consultation
                                    and detailed quote.
                                </p>
                                <div className="space-y-4">
                                    <Link
                                        href="/contact"
                                        className="block w-full px-6 py-4 bg-aloe-green text-charcoal font-bold rounded-full hover:bg-green-hover transition-colors text-center"
                                    >
                                        Get a Quote
                                    </Link>
                                    <Link
                                        href="tel:0116932600"
                                        className="block w-full px-6 py-4 border-2 border-charcoal text-charcoal font-bold rounded-full hover:bg-charcoal hover:text-white transition-colors text-center"
                                    >
                                        Call 011 693 2600
                                    </Link>
                                </div>
                                <div className="mt-6 pt-6 border-t border-border-grey">
                                    <p className="text-sm text-medium-grey">
                                        <strong>Email:</strong> team@aloesigns.co.za
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
