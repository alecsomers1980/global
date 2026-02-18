import Link from "next/link";
import { ArrowRight, Scale, Briefcase, Heart, Home, AlertCircle, Gavel } from "lucide-react";

const services = [
    {
        icon: Scale,
        title: "Civil Litigation",
        description: "Expert representation in complex disputes, ensuring your rights are defended in and out of court.",
        slug: "litigation",
    },
    {
        icon: Heart,
        title: "Family Law",
        description: "Compassionate guidance through divorce, custody, and matrimonial property matters.",
        slug: "family",
    },
    {
        icon: Briefcase,
        title: "Commercial Law",
        description: "Strategic legal solutions for businesses, contracts, and corporate governance.",
        slug: "commercial",
    },
    {
        icon: Home,
        title: "Property & Estates",
        description: "Assistance with transfers, evictions, wills, and deceased estate administration.",
        slug: "property",
    },
    {
        icon: AlertCircle,
        title: "Personal Injury",
        description: "Fighting for fair compensation in RAF and medical negligence claims.",
        slug: "personal-injury",
    },
    {
        icon: Gavel,
        title: "Criminal Law",
        description: "Strong defense representation for bail applications and criminal trials.",
        slug: "criminal",
    },
];

export function ServiceGrid() {
    return (
        <section className="py-20 bg-brand-cream">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
                        Our Practice Areas
                    </h2>
                    <p className="text-muted-foreground">
                        We offer specialized legal services tailored to the unique needs of South African individuals and businesses.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <Link
                            key={service.slug}
                            href={`/practice-areas/${service.slug}`}
                            className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-brand-gold/20 hover:-translate-y-1 block"
                        >
                            <div className="mb-6 inline-flex p-3 rounded-lg bg-brand-navy/5 text-brand-navy group-hover:bg-brand-navy group-hover:text-brand-gold transition-colors">
                                <service.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-gold transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-muted-foreground mb-6 line-clamp-3">
                                {service.description}
                            </p>
                            <div className="flex items-center text-sm font-semibold text-brand-navy group-hover:underline">
                                Learn More <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
