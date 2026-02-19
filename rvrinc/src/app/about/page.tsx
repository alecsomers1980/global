import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                {/* Hero Section */}
                <section className="bg-brand-navy py-16 text-center text-white relative overflow-hidden">
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
                    <div className="container relative z-10">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About Us</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                            A boutique law firm dedicated to compassionate legal assistance and professional excellence.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-20">
                    <div className="container max-w-4xl space-y-16">

                        {/* History */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-brand-navy border-b border-brand-gold/30 pb-4">Our History</h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed">
                                <p>
                                    Roets & Van Rensburg Inc. has established itself as a reputable boutique law firm with a strong presence in both Gauteng and Limpopo.
                                    Our head office is situated in Centurion, Pretoria, with a branch office in Marble Hall, Limpopo province.
                                </p>
                                <p>
                                    Under the leadership of <strong>Tanya Louise Kehrhahn</strong>, the firm has grown to become a trusted name in the legal fraternity.
                                    We pride ourselves on our deep-rooted commitment to our clients and our ability to adapt to the evolving legal landscape while maintaining traditional values of integrity and trust.
                                </p>
                            </div>
                        </div>

                        {/* Mission */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-brand-navy border-b border-brand-gold/30 pb-4">Our Mission</h2>
                            <ul className="space-y-4 text-gray-600 list-disc pl-6 marker:text-brand-gold">
                                <li>Subject to the Constitution of the Republic of South Africa, we are committed to serving our clients with integrity, honesty, and responsibility.</li>
                                <li>We strive to execute our mandate with the highest standard of legal expertise.</li>
                                <li>We are dedicated to finalizing our clients&apos; matters as expeditiously and cost-effectively as possible.</li>
                                <li>We consistently evaluate and improve our services to meet the changing needs of our clients.</li>
                                <li>We foster a culture of transparency and accountability in all our dealings.</li>
                            </ul>
                        </div>

                        {/* Vision */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-brand-navy border-b border-brand-gold/30 pb-4">Our Vision</h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed">
                                <p>
                                    To be the preferred legal partner for individuals and correspondents alike, known for our unwavering dedication to justice and client satisfaction.
                                    We aim to surpass expectations in Road Accident Fund matters and provide exceptional support to our correspondent colleagues across the country.
                                </p>
                                <p>
                                    We envision a firm where every client feels heard, supported, and expertly represented, regardless of the complexity of their case.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Call to Action */}
                <section className="bg-brand-gray py-16 text-center">
                    <div className="container">
                        <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Need Legal Assistance?</h2>
                        <Link href="/contact">
                            <Button size="lg" variant="brand">Contact Us Today</Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
