export const metadata = {
    title: "The Everest Way | About Everest Motoring",
    description: "Learn about the Everest Way. Our 100-point checks, selective vehicle sourcing, and commitment to integrity in the South African used car market.",
};

import PageBanner from "@/components/PageBanner";

export default function AboutPage() {
    return (
        <div className="bg-background-alt min-h-screen">
            {/* Hero Section */}
            <PageBanner
                title="The Everest Way"
                subtitle="Redefining the pre-owned vehicle experience in Mpumalanga and across South Africa through uncompromising quality and integrity."
                bgImageUrl="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2671&auto=format&fit=crop"
                overlayOpacity="opacity-20"
            />

            {/* Content Section */}
            <section className="py-20 px-4 lg:px-12">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-slate-100">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 text-primary">Uncompromising Standards</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                        At Everest Motoring, we do not simply buy stock to fill a showroom floor. We operate on a model of <strong>Selective Sourcing</strong>. Every vehicle undergoes a rigorous, independent 100-point technical inspection before it even arrives on our floor.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                        <div className="border-l-4 border-secondary pl-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Accident-Free Guarantee</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">We strictly enforce a zero-tolerance policy for structurally damaged or rebuilt vehicles. You are buying absolute peace of mind.</p>
                        </div>
                        <div className="border-l-4 border-primary pl-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Mileage</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Full franchise service histories are explicitly verified to ensure the mileage on the clock is completely accurate.</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-6 text-secondary mt-12">Why Choose Us?</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                        Purchasing a vehicle is a massive financial commitment. Our goal is to make the process completely seamless, completely transparent, and ultimately an exciting experience. From offering in-house finance through all major South African banks to delivering vehicles nationwide, we handle the complex logistics so you don't have to.
                    </p>
                </div>
            </section>
        </div>
    );
}
