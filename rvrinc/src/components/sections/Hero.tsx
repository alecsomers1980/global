import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
    return (
        <section className="relative w-full py-20 lg:py-32 bg-brand-navy overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/header3.jpg"
                    alt="Law Office"
                    fill
                    className="object-cover object-right opacity-20 mix-blend-overlay"
                    priority
                />
                <div className="absolute inset-0 bg-brand-navy/60 mix-blend-multiply" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center gap-12 max-w-4xl mx-auto">
                <div className="space-y-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-semibold tracking-wider uppercase">
                        EST. 1995 • Pretoria, South Africa
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
                        Upholding Justice. <br />
                        <span className="text-brand-gold">Protecting Your Future.</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
                        Roets & Van Rensburg Attorneys provides authoritative legal counsel in Civil Litigation, Family Law, and Commercial Disputes. We fight for your rights with unwavering commitment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <Link href="/login?mode=signup">
                            <Button size="lg" variant="brand" className="w-full sm:w-auto font-normal">
                                Book a Consultation
                            </Button>
                        </Link>
                        <Link href="/portal">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-brand-navy bg-brand-gold border-brand-gold hover:bg-brand-gold/90 font-normal">
                                Track Your Case
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 pt-2">
                        Trusted by over 2,000 clients across South Africa.
                    </p>
                </div>
            </div>
        </section>
    );
}
