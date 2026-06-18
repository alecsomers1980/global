import Link from "next/link";
import { ArrowRight, Car, UserRound, Users, Stethoscope, TrendingUp, Clock } from "lucide-react";

const services = [
    {
        icon: Car,
        title: "Pedestrian & Passenger Claims",
        description: "Whether you were struck as a pedestrian or injured as a passenger, you have a right to claim from the Road Accident Fund. We handle the full process — from lodgement to payment.",
        slug: "pedestrian-passenger",
    },
    {
        icon: UserRound,
        title: "Serious Injury Assessment",
        description: "If your injuries qualify under the serious injury threshold, you may claim general damages. We guide you through the HPCSA assessment and fight for the compensation you deserve.",
        slug: "serious-injury",
    },
    {
        icon: TrendingUp,
        title: "Loss of Earnings & Support",
        description: "An accident that prevents you from working — or that took your breadwinner — carries a quantifiable financial loss. We build a proper actuarial claim to recover past and future income.",
        slug: "loss-of-earnings",
    },
    {
        icon: Stethoscope,
        title: "Medical Expenses",
        description: "Past hospital bills, specialist visits, rehabilitation, and future medical costs can all form part of your RAF claim. We ensure nothing is left out of your schedule of damages.",
        slug: "medical-expenses",
    },
    {
        icon: Users,
        title: "Dependants & Wrongful Death",
        description: "If a family member was killed in a road accident, dependants may claim for loss of support. We handle funeral costs, dependency calculations, and the full RAF process on your behalf.",
        slug: "wrongful-death",
    },
    {
        icon: Clock,
        title: "Prescription & Late Claims",
        description: "RAF claims prescribe three years from the accident date — missing this deadline can bar your claim entirely. Contact us immediately; in some circumstances late claims can still be saved.",
        slug: "prescription",
    },
];

export function ServiceGrid() {
    return (
        <section className="py-20 bg-brand-cream">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
                        Road Accident Fund Claims
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        We specialise exclusively in RAF matters. From first consultation to final payment, our attorneys manage every step of your Road Accident Fund claim — at no upfront cost to you.
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
                            <p className="text-muted-foreground mb-6">
                                {service.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
