import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Award, BookOpen, ArrowLeft } from "lucide-react";
import { Attorney } from "@/types";



export default async function AttorneyProfile({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: attorney } = await supabase
        .from("attorneys")
        .select("*")
        .eq("slug", params.slug)
        .single();

    const attorneyProfile = attorney as unknown as Attorney;

    if (!attorneyProfile) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                <section className="bg-brand-navy py-12 text-white">
                    <div className="container">
                        <Link href="/team" className="inline-flex items-center text-brand-gold hover:underline mb-8 text-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Team
                        </Link>
                        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                            <div className="w-64 h-64 bg-gray-200 rounded-lg shrink-0 border-4 border-white/10 overflow-hidden relative">
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-5xl font-serif text-white/20">
                                    {attorneyProfile.name.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <h1 className="text-4xl md:text-5xl font-serif font-bold">{attorneyProfile.name}</h1>
                                <p className="text-xl text-brand-gold font-medium">{attorneyProfile.role}</p>
                                <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                                    {attorneyProfile.bio}
                                </p>
                                <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                                    <Link href="/contact">
                                        <Button variant="brand" size="lg">Schedule Consultation</Button>
                                    </Link>
                                    <Link href={`mailto:${attorneyProfile.email}`}>
                                        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                                            <Mail className="w-4 h-4 mr-2" /> Email {attorneyProfile.name.split(' ')[0]}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container grid md:grid-cols-2 gap-16">

                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6 flex items-center gap-3">
                                <Award className="w-6 h-6 text-brand-gold" />
                                Qualifications & Admissions
                            </h2>
                            <ul className="space-y-4">
                                {attorneyProfile.qualifications?.map((qual: string, i: number) => (
                                    <li key={i} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="w-2 h-2 bg-brand-navy rounded-full mt-2 mr-3 shrink-0"></span>
                                        <span className="text-gray-700 font-medium">{qual}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-brand-gold" />
                                Areas of Expertise
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {attorneyProfile.specialties?.map((spec: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-brand-navy/5 text-brand-navy rounded-full font-medium border border-brand-navy/10">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
