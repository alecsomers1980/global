import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Construction } from "lucide-react";
import Image from "next/image";

export default function InsightsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-brand-navy py-20 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image src="/images/header3.jpg" alt="Law Office" fill className="object-cover object-right opacity-15 mix-blend-overlay" priority />
                        <div className="absolute inset-0 bg-brand-navy/70 mix-blend-multiply" />
                    </div>
                    <div className="container relative z-10">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Insights</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg">Stay informed with the latest legal insights.</p>
                    </div>
                </section>

                {/* Under Construction */}
                <section className="py-32 text-center">
                    <div className="container max-w-lg mx-auto space-y-6">
                        <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto">
                            <Construction className="w-10 h-10 text-brand-gold" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-brand-navy">Coming Soon</h2>
                        <p className="text-gray-500 leading-relaxed">
                            We are currently building our Insights section where we will share expert commentary on RAF legislation, case studies, and legal updates. Check back soon.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <div className="h-px w-12 bg-brand-gold/30" />
                            <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase">Under Construction</span>
                            <div className="h-px w-12 bg-brand-gold/30" />
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
