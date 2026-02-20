import { PageHeader } from "@/components/layout/page-header";
import { ValuesSection } from "@/components/layout/values";
import { TeamSection } from "@/components/layout/team";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "About Spanslab | Concrete Experts in Nelspruit",
    description: "Learn about Spanslab's history, our commitment to quality construction materials, and the team driving our success in Mpumalanga.",
};

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader
                title="Building Trust, One Slab at a Time"
                description="We are Mpumalanga's premier supplier of industrial-grade concrete products, committed to precision and strength."
                image="https://images.unsplash.com/photo-1590644365607-1c5aef933181?q=80&w=2670&auto=format&fit=crop"
            />

            {/* Story Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-slate-DEFAULT mb-6">
                                Our Journey
                            </h2>
                            <div className="space-y-4 text-slate-light text-lg leading-relaxed">
                                <p>
                                    Established in 2008, Spanslab began with a simple mission: to provide Nelspruit's construction industry with a reliable local source for high-quality precast concrete products.
                                </p>
                                <p>
                                    What started as a small yard producing paving blocks has grown into a fully automated manufacturing facility capable of supplying large-scale civil and residential projects.
                                </p>
                                <p>
                                    Today, we are proud to be the region's preferred supplier for Rib & Block slabs, ensuring structural integrity and efficiency for hundreds of homes and commercial buildings across the Lowveld.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link href="/contact">
                                    <Button className="bg-orange-DEFAULT hover:bg-orange-hover text-white">
                                        Work With Us
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=1997&auto=format&fit=crop"
                                alt="Spanslab Factory Floor"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <ValuesSection />
            <TeamSection />
        </div>
    );
}
