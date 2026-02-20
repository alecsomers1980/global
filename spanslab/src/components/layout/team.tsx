"use client";

import Image from "next/image";

const team = [
    {
        name: "Marius Venter",
        role: "Founder & CEO",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    },
    {
        name: "Sarah Nkosi",
        role: "Operations Director",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    },
    {
        name: "David Smit",
        role: "Technical Manager",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    },
    {
        name: "Lerato Khumalo",
        role: "Sales Lead",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    },
];

export function TeamSection() {
    return (
        <section className="py-20 bg-concrete-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-DEFAULT mb-4">Meet Our Team</h2>
                    <p className="text-slate-light max-w-2xl mx-auto">
                        The experts behind Spanslab.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member) => (
                        <div key={member.name} className="group text-center">
                            <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-md">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-DEFAULT">{member.name}</h3>
                            <p className="text-sm text-orange-DEFAULT font-medium">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
