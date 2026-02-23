import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
    return (
        <section className="relative w-full min-h-[90vh] bg-brand-navy overflow-hidden flex items-center">
            <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
                {/* Left Side — Logo & Copy */}
                <div className="flex flex-col items-center text-center py-16 lg:py-24 px-4 lg:px-12">
                    {/* Logo */}
                    <div className="relative w-64 h-24 md:w-80 md:h-28 mb-8">
                        <Image
                            src="/images/logo.png"
                            alt="Roets & Van Rensburg Inc."
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Established Line */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px w-8 bg-brand-gold/50" />
                        <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase">
                            Est. 2000 &nbsp;•&nbsp; Pretoria & Marble Hall
                        </span>
                        <div className="h-px w-8 bg-brand-gold/50" />
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight mb-6">
                        Proven Paths to <br />
                        <span className="text-brand-gold">Fair Compensation</span>
                    </h1>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed max-w-lg text-sm md:text-base mb-8">
                        As specialists in RAF claims, Roets & Van Rensburg Inc provides the sophisticated legal strategy required to navigate the Road Accident Fund landscape. Our dedicated team specializes in securing the best possible outcomes for victims of motor vehicle accidents. With a proven track record, we turn the legal difficulties into life-changing results.
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <Link href="/start-claim">
                            <Button size="lg" variant="brand" className="w-full sm:w-auto">
                                Start Your Claim
                            </Button>
                        </Link>
                        <Link href="/case-update">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-brand-gold border-brand-gold/40 hover:bg-brand-gold/10">
                                Update on Your Case
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Line */}
                    <p className="text-gray-500 text-sm tracking-wide">
                        Trusted by over 2,000 clients across South Africa
                    </p>
                </div>

                {/* Right Side — Hammer/Gavel Image */}
                <div className="relative hidden lg:block h-full min-h-[90vh]">
                    <Image
                        src="/images/header3.jpg"
                        alt="Justice — Gavel and Law"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    {/* Gradient overlay for left blend */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/40 to-transparent" />
                    {/* Subtle gold accent line */}
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent" />
                </div>
            </div>

            {/* Mobile background image */}
            <div className="absolute inset-0 lg:hidden z-0">
                <Image
                    src="/images/header3.jpg"
                    alt="Justice"
                    fill
                    className="object-cover object-right opacity-10"
                />
            </div>
        </section>
    );
}
