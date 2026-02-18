import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail, Linkedin } from "lucide-react";
import { Attorney } from "@/types";

export default async function TeamPage() {
    const supabase = createClient();
    const { data: attorneys } = await supabase
        .from("attorneys")
        .select("*")
        .order("name");
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                <section className="bg-gray-50 py-16 text-center">
                    <div className="container">
                        <h1 className="text-4xl font-serif font-bold text-brand-navy mb-4">Our Attorneys</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            A dedicated team of legal professionals committed to upholding justice and serving our clients with integrity.
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                        {attorneys?.map((attorney: Attorney) => (
                            <div key={attorney.id} className="flex flex-col items-center text-center">
                                <div className="w-48 h-48 bg-gray-200 rounded-full mb-6 overflow-hidden border-4 border-white shadow-lg">
                                    {/* Placeholder for real image */}
                                    <div className="w-full h-full bg-brand-navy/10 flex items-center justify-center text-brand-navy/30 text-4xl font-serif">
                                        {attorney.name.charAt(0)}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-brand-navy">{attorney.name}</h2>
                                <span className="text-brand-gold font-medium uppercase text-xs tracking-wider mb-4 block mt-1">{attorney.role}</span>

                                <p className="text-gray-600 mb-6 line-clamp-3 px-4">
                                    {attorney.bio}
                                </p>

                                <div className="flex gap-4">
                                    <Link href={`mailto:${attorney.email}`}>
                                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-brand-navy hover:text-white">
                                            <Mail className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    {attorney.linkedin && (
                                        <Link href={attorney.linkedin}>
                                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-600 hover:text-white">
                                                <Linkedin className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href={`/team/${attorney.slug}`}>
                                        <Button variant="outline" size="sm" className="rounded-full">View Profile</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
