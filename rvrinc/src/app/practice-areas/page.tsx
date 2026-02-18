import { practiceAreas } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Scale, Briefcase, Heart, Home, AlertCircle, Gavel } from "lucide-react";
import { PracticeArea } from "@/types";

// Icon mapping helper
const IconMap: Record<string, any> = {
    Scale, Briefcase, Heart, Home, AlertCircle, Gavel
};

export default function PracticeAreasPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                {/* Page Header */}
                <section className="bg-brand-navy py-16 text-white text-center">
                    <div className="container">
                        <h1 className="text-4xl font-serif font-bold mb-4">Our Practice Areas</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Comprehensive legal expertise tailored to your personal and business needs.
                        </p>
                    </div>
                </section>

                {/* List */}
                <section className="py-20">
                    <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {practiceAreas?.map((area: PracticeArea) => {
                            const Icon = IconMap[area.icon] || Scale;
                            return (
                                <div key={area.id} className="group bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-gold group-hover:text-brand-navy transition-colors">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-brand-navy mb-3">{area.title}</h2>
                                    <p className="text-muted-foreground mb-6 h-24 overflow-hidden">{area.description}</p>
                                    <ul className="mb-6 space-y-2">
                                        {area.features.slice(0, 3).map((feat, i) => (
                                            <li key={i} className="flex items-start text-sm text-gray-600">
                                                <span className="mr-2 text-brand-gold">•</span> {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={`/practice-areas/${area.slug}`}>
                                        <Button variant="outline" className="w-full group-hover:bg-brand-navy group-hover:text-white group-hover:border-brand-navy">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-brand-cream py-20 text-center">
                    <div className="container">
                        <h2 className="text-3xl font-serif font-bold text-brand-navy mb-6">Need Legal Advice?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                            Every case is unique. Schedule a consultation with one of our specialists to discuss your legal options.
                        </p>
                        <Link href="/contact">
                            <Button size="lg" variant="brand">Book a Consultation</Button>
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
