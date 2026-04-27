import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import LeadForm from "./LeadForm";
import VehicleGallery from "./VehicleGallery";
import ViewItemTracker from "@/components/ViewItemTracker";
import { buildVehicleJsonLd } from "@/utils/seo/vehicleSchema";
import { getVehicleUrl } from "@/utils/url/vehicleUrl";
import {
    computeFallbackMetaTitle,
    computeFallbackMetaDescription,
} from "@/utils/ai/seoGenerator";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveCar(supabase, param, columns) {
    if (UUID_REGEX.test(param)) {
        return await supabase.from("cars").select(columns).eq("id", param).single();
    }
    // Slug format: "...-{8char-hex}" — match by uuid range on the leading 8 hex chars.
    // Plain ilike on a uuid column fails at Postgres (type mismatch), so we use gte/lte
    // bounds that cover every uuid starting with shortId.
    const shortId = param.split("-").pop();
    if (/^[0-9a-f]{8}$/i.test(shortId)) {
        const lo = `${shortId}-0000-0000-0000-000000000000`;
        const hi = `${shortId}-ffff-ffff-ffff-ffffffffffff`;
        return await supabase
            .from("cars")
            .select(columns)
            .gte("id", lo)
            .lte("id", hi)
            .limit(1)
            .single();
    }
    return { data: null, error: new Error("Invalid identifier") };
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: car } = await resolveCar(
        supabase,
        id,
        "id, make, model, year, price, mileage, transmission, fuel_type, main_image_url, seo_meta_title, seo_meta_description"
    );

    if (!car) return { title: "Vehicle Not Found" };

    const title = car.seo_meta_title || computeFallbackMetaTitle(car);
    const description = car.seo_meta_description || computeFallbackMetaDescription(car);
    const canonicalUrl = getVehicleUrl(car, SITE_URL);

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: "website",
            images: car.main_image_url ? [{ url: car.main_image_url }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: car.main_image_url ? [car.main_image_url] : [],
        },
    };
}

export default async function CarDetailsPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: car, error } = await resolveCar(supabase, id, "*");

    if (error || !car) {
        notFound();
    }

    const jsonLd = buildVehicleJsonLd(car, { siteUrl: SITE_URL });

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewItemTracker car={car} />
        <div className="bg-background-alt min-h-screen py-12 px-4 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    <VehicleGallery car={car} />

                    {/* Details Content */}
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div>
                                <div className="inline-block px-3 py-1 bg-green-50 text-green-700 font-bold text-xs uppercase tracking-wider rounded-md mb-4 border border-green-200">
                                    {car.status === 'available' ? 'Available Now' : 'Reserved'}
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                                    {car.year} {car.make} {car.model}
                                </h1>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Retail Price</p>
                                <div className="text-3xl font-bold text-black">
                                    R {new Intl.NumberFormat('en-ZA').format(car.price)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Vehicle Specifications</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Make</p>
                                        <p className="font-bold text-slate-900">{car.make}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Model</p>
                                        <p className="font-bold text-slate-900">{car.model}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Year</p>
                                        <p className="font-bold text-slate-900">{car.year}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Mileage</p>
                                        <p className="font-bold text-slate-900">{new Intl.NumberFormat('en-ZA').format(car.mileage)} km</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Transmission</p>
                                        <p className="font-bold text-slate-900">{car.transmission || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Fuel Type</p>
                                        <p className="font-bold text-slate-900">{car.fuel_type || 'N/A'}</p>
                                    </div>
                                </div>

                                {car.features && car.features.length > 0 && (
                                    <>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Premium Features</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mb-12">
                                            {car.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-slate-700">
                                                    <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                                                    <span className="font-medium text-sm">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Description</h2>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                    {car.description || (
                                        <p className="italic text-slate-400">Detailed overview of this vehicle's pristine condition, 100-point check results, and extra features will be populated here.</p>
                                    )}
                                </div>
                            </div>

                            {/* CRM Lead Generation Sidebar */}
                            <div className="bg-black rounded-2xl p-8 text-white h-fit sticky top-24 shadow-xl">
                                <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Interested in this car?</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Leave your details below and a dedicated sales executive will contact you to arrange a viewing or discuss finance options.
                                </p>

                                <LeadForm carId={car.id} />

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <h4 className="text-white font-bold mb-3">Ready to start financing?</h4>
                                    <a href={`/login?register=client&car_id=${car.id}`} className="block w-full text-center bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black transition-colors py-3 rounded-lg font-bold">
                                        Create Client Account
                                    </a>
                                </div>

                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                                    <span className="material-symbols-outlined text-green-500">lock</span>
                                    Secure Lead System
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
