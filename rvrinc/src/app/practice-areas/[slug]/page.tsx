import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { PracticeArea } from "@/types";



export default async function PracticeAreaDetail({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: area } = await supabase
        .from("practice_areas")
        .select("*")
        .eq("slug", params.slug)
        .single();

    const practiceArea = area as unknown as PracticeArea;

    if (!practiceArea) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                {/* Banner */}
                <section className="bg-brand-navy py-20 text-white relative overflow-hidden">
                    <div className="container relative z-10">
                        <Link href="/practice-areas" className="inline-flex items-center text-brand-gold hover:underline mb-6 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Practice Areas
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{practiceArea.title}</h1>
                        <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                            {practiceArea.description}
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container grid md:grid-cols-3 gap-12">

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-12">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-navy mb-6">How We Can Help</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    At Roets & Van Rensburg, we understand that {practiceArea.title.toLowerCase()} matters require a strategic and personalized approach. Our team is dedicated to guiding you through every step of the legal process.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {practiceArea.features?.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start bg-gray-50 p-4 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-brand-gold mr-3 mt-0.5" />
                                            <span className="text-brand-navy font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-brand-navy mb-6">Common Questions</h2>
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold text-brand-navy">What is the first step in this process?</h3>
                                        <p className="text-gray-600 mt-2 text-sm">We recommend an initial consultation to assess the merits of your case and provide a clear roadmap.</p>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold text-brand-navy">How long does a typical case take?</h3>
                                        <p className="text-gray-600 mt-2 text-sm">Timelines vary significantly based on complexity. We strive for expedited resolutions wherever possible.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-brand-cream p-8 rounded-xl border border-brand-gold/20">
                                <h3 className="text-xl font-serif font-bold text-brand-navy mb-4">Get Expert Advice</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Don&apos;t navigate complex legal challenges alone. Contact our {practiceArea.title} specialists today.
                                </p>
                                <Link href="/contact" className="block">
                                    <Button className="w-full" variant="brand">Book Consultation</Button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
