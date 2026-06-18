import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { Mail, Linkedin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Team",
    description: "Meet the dedicated legal professionals of Roets & Van Rensburg Inc. across our Pretoria and Marble Hall branches.",
    alternates: { canonical: "/team" },
};

interface TeamMember {
    name: string;
    role: string;
    image: string;
    email?: string;
    linkedin?: string;
}

const pretoriaStaff: TeamMember[] = [
    { name: "Tanya Kehrhahn", role: "Director", image: "/images/Pretoria/Tanya.webp" },
    { name: "Karmi du Plessis", role: "Associate Attorney", image: "/images/Pretoria/Karmi.webp" },
    { name: "Nieuwoudt du Plessis", role: "Professional Assistant (Attorney)", image: "/images/Pretoria/Nieuwoudt.webp" },
    { name: "Karyn Ebersohn", role: "Candidate Attorney", image: "/images/Pretoria/Karyn.webp" },
    { name: "Minah Lekokoane", role: "Candidate Attorney", image: "/images/Pretoria/Minah.webp" },
    { name: "Roxanne Allan", role: "Candidate Attorney", image: "/images/Pretoria/Roxanne.webp" },
    { name: "Lizzy Nkwinika", role: "Legal Assistant", image: "/images/Pretoria/Lizzy.webp" },
    { name: "Sara Nkwinika", role: "Receptionist & Legal Assistant", image: "/images/Pretoria/Sara.webp" },
    { name: "Tricia Lombard", role: "Legal Secretary", image: "/images/Pretoria/Tricia.webp" },
    { name: "Werner Jacobs", role: "Legal Assistant", image: "/images/Pretoria/Werner.webp" },
    { name: "George Nkwinika", role: "Messenger and Driver", image: "/images/Pretoria/George.webp" },
];

const marbleHallStaff: TeamMember[] = [
    { name: "Alwyn Burger", role: "Attorney", image: "/images/Marble Hall/Alwyn.webp" },
    { name: "Yolandé Klopper", role: "Accountant & HR", image: "/images/Marble Hall/Yolande.webp" },
    { name: "Martie Pienaar", role: "Legal Secretary", image: "/images/Marble Hall/Martie.webp" },
    { name: "Olgah Malefo", role: "Legal Assistant", image: "/images/Marble Hall/Olgah.webp" },
    { name: "Lineque Schoeman", role: "Receptionist & Legal Assistant", image: "/images/Marble Hall/Lineque.webp" },
    { name: "Joel Raborifi", role: "Messenger and Driver", image: "/images/Marble Hall/Joel.webp" },
];

function TeamGrid({ title, members }: { title: string, members: TeamMember[] }) {
    return (
        <section className="py-16">
            <div className="container">
                <h2 className="text-3xl font-serif font-bold text-brand-navy mb-12 text-center border-b border-brand-gold/30 pb-4 inline-block mx-auto">
                    {title}
                </h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
                    {members.map((member) => (
                        <div key={member.name} className="flex flex-col items-center text-center group w-full max-w-xs mx-auto">
                            <div className="w-full aspect-[3/4] relative bg-[url('/images/staff-bg.jpg')] bg-cover bg-center rounded-xl mb-6 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover object-top"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-brand-navy">{member.name}</h3>
                            <span className="text-brand-gold font-medium uppercase text-xs tracking-wider mb-2 block">{member.role}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function TeamPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-gray-50/50">

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
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Team</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                            A dedicated team of legal professionals committed to upholding justice and serving our clients with integrity across our Pretoria and Marble Hall branches.
                        </p>
                    </div>
                </section>

                <TeamGrid title="Pretoria Branch" members={pretoriaStaff} />

                <div className="container px-4"><div className="w-full h-px bg-gray-200" /></div>

                <TeamGrid title="Marble Hall Branch" members={marbleHallStaff} />

                {/* Group Photos */}
                <section className="py-20 bg-white border-t border-gray-100">
                    <div className="container">
                        <h2 className="text-3xl font-serif font-bold text-brand-navy mb-12 text-center">
                            Our Office Families
                        </h2>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-4 text-center">
                                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl skew-y-1 transform transition-transform hover:skew-y-0 duration-500 bg-[url('/images/staff-bg.jpg')] bg-cover bg-center">
                                    <Image
                                        src="/images/Ptagroup.webp"
                                        alt="Pretoria Team"
                                        fill
                                        className="object-cover object-center"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-brand-navy pt-4">Pretoria Team</h3>
                            </div>
                            <div className="space-y-4 text-center">
                                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl -skew-y-1 transform transition-transform hover:skew-y-0 duration-500 bg-[url('/images/staff-bg.jpg')] bg-cover bg-center z-0">
                                    <Image
                                        src="/images/Marble Hall/Mhgroup.webp"
                                        alt="Marble Hall Team"
                                        fill
                                        className="object-contain scale-[1.45] -translate-y-6"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-brand-navy pt-4">Marble Hall Team</h3>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
