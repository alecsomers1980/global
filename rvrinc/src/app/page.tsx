import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ShieldCheck, Clock, Users } from "lucide-react";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                <Hero />

                {/* Trust Indicators */}
                <div className="bg-white border-b border-gray-100 py-8">
                    <div className="container flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
                        {/* Placeholders for logos */}
                        <div className="font-serif font-bold text-xl text-gray-400">Law Society of SA</div>
                        <div className="font-serif font-bold text-xl text-gray-400">Legal Practice Council</div>
                        <div className="font-serif font-bold text-xl text-gray-400">Pretoria Attorneys Assoc.</div>
                    </div>
                </div>

                {/* Intro */}
                <section className="py-20 bg-white">
                    <div className="container grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                                {/* Image Placeholder */}
                                <div className="w-full h-full bg-brand-navy/10 flex items-center justify-center text-brand-navy/20">
                                    Office Image
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-brand-gold p-8 rounded-lg shadow-xl hidden md:block">
                                <div className="text-4xl font-bold text-brand-navy">30+</div>
                                <div className="text-sm font-semibold text-brand-navy/80 uppercase tracking-wider">Years Experience</div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif font-bold text-brand-navy">
                                A Legacy of Excellence & Trust
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Founded in 1995, Roets & Van Rensburg has built a reputation for solving the most complex legal challenges with precision and integrity. We combine deep legal knowledge with a modern, client-centric approach.
                            </p>
                            <ul className="space-y-3 pt-2">
                                <li className="flex items-center gap-3 text-brand-navy font-medium">
                                    <ShieldCheck className="w-5 h-5 text-brand-gold" />
                                    <span>Strict confidentiality and ethical standards</span>
                                </li>
                                <li className="flex items-center gap-3 text-brand-navy font-medium">
                                    <Users className="w-5 h-5 text-brand-gold" />
                                    <span>Personalized attention from senior attorneys</span>
                                </li>
                                <li className="flex items-center gap-3 text-brand-navy font-medium">
                                    <Clock className="w-5 h-5 text-brand-gold" />
                                    <span>Efficient resolution of legal matters</span>
                                </li>
                            </ul>
                            <div className="pt-4">
                                <Link href="/team">
                                    <Button variant="outline">Meet Our Attorneys</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <ServiceGrid />

                {/* Case Tracker Teaser */}
                <section className="py-20 bg-brand-navy text-white relative overflow-hidden">
                    <div className="container relative z-10 text-center space-y-8 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-serif font-bold">Secure Client Portal</h2>
                        <p className="text-gray-300">
                            We believe in transparency. Track the status of your case, view documents, and communicate with your attorney through our secure digital platform.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/portal">
                                <Button variant="brand" size="lg">Access Secure Portal</Button>
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
