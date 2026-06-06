import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import InventoryFilter from "./InventoryFilter";
import { altForImage } from "@/utils/ai/seoGenerator";
import { getVehiclePath } from "@/utils/url/vehicleUrl";

export const metadata = {
    title: "Inventory | Everest Motoring",
    description: "Browse our exclusive collection of premium pre-owned, accident-free vehicles.",
};

export default async function InventoryPage({ searchParams }) {
    const supabase = await createClient();

    // Await searchParams for Next.js 15+ compatibility
    const params = await searchParams || {};
    const { make, model, maxPrice, transmission, fuel_type, features } = params;

    let query = supabase
        .from("cars")
        .select("*, sales(sold_at)");
        
    // We cannot easily do complex OR conditions with joined tables in Supabase JS, 
    // so we fetch available and sold, then filter in memory for the 1-week rule.
    query = query.in("status", ["available", "sold"]);

    if (make) query = query.ilike('make', `%${make}%`);
    if (model) query = query.ilike('model', `%${model}%`);
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    if (transmission) {
        const transArr = Array.isArray(transmission) ? transmission : [transmission];
        query = query.in('transmission', transArr);
    }
    if (fuel_type) {
        const fuelArr = Array.isArray(fuel_type) ? fuel_type : [fuel_type];
        query = query.in('fuel_type', fuelArr);
    }
    if (features) {
        const featArr = Array.isArray(features) ? features : [features];
        query = query.contains('features', featArr);
    }

    const { data: allCars, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching vehicles:", error.message || error, JSON.stringify(error));
    }

    // Keep sold cars visible (with the SOLD banner) for 2 weeks, then drop them.
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const cars = (allCars || []).filter(car => {
        if (car.status === "available") return true;
        if (car.status === "sold") {
            const soldAtStr = car.sales?.[0]?.sold_at;
            if (!soldAtStr) return false; // If marked sold but no sale record, hide it as a fallback
            const soldAtDate = new Date(soldAtStr);
            return soldAtDate >= twoWeeksAgo;
        }
        return false;
    });


    return (
        <div className="bg-background-alt min-h-screen">
            <PageBanner
                title="Our Premium Fleet"
                subtitle="Browse our exclusive collection of 100-point checked vehicles."
            />
            <div className="py-16 px-4 lg:px-12">
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8">

                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-[300px] flex-shrink-0 z-10">
                        <InventoryFilter />
                    </div>

                    {/* Main Content Grid */}
                    <div className="w-full flex-1 flex flex-col min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">

                            {cars && cars.map((car) => (
                                <Link
                                    key={car.id}
                                    href={getVehiclePath(car)}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
                                >
                                    {/* Thumbnail Area */}
                                    <div className="relative aspect-[4/3] bg-black overflow-hidden">
                                        {car.main_image_url ? (
                                            <Image
                                                src={car.main_image_url}
                                                alt={altForImage(car, car.main_image_url, 0, 1)}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-700">
                                                <span className="material-symbols-outlined text-4xl">directions_car</span>
                                            </div>
                                        )}

                                        {/* Status Badge / Sold band */}
                                        {car.status === 'sold' ? (
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                                                <div className="w-[150%] py-2.5 bg-black/70 shadow-lg rotate-[-34deg] text-center">
                                                    <span className="text-primary font-black text-2xl tracking-[0.3em] uppercase">Sold</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 font-bold text-xs uppercase tracking-wider rounded-md border border-white/20 shadow-lg">
                                                    {car.status === 'available' ? 'Available' : 'Reserved'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Area */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900 transition-colors">
                                                    {car.year} {car.make}
                                                </h2>
                                                <p className="text-xs font-medium text-slate-500">{car.model}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-400 mb-6 pb-6 border-b border-slate-100">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">speed</span>
                                                    {new Intl.NumberFormat('en-ZA').format(car.mileage)} km
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">local_gas_station</span>
                                                    {car.fuel_type || 'Fuel'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">settings</span>
                                                    {car.transmission === 'Automatic' ? 'Auto' : 'Manual'}
                                                </span>
                                                {car.drivetrain && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">settings_input_component</span>
                                                        {car.drivetrain}
                                                    </span>
                                                )}
                                                {car.colour && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">palette</span>
                                                        {car.colour}
                                                    </span>
                                                )}
                                                {car.has_warranty && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <span className="material-symbols-outlined text-[16px]">verified</span>
                                                        Warranty
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">
                                                    R {new Intl.NumberFormat('en-ZA').format(car.price)}
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors text-slate-400">
                                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {(!cars || cars.length === 0) && (
                                <div className="col-span-full py-24 text-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">inventory_2</span>
                                    <p className="text-slate-500 text-lg">Our showroom is currently being updated with new premium stock.</p>
                                    <p className="text-slate-400">Please check back again soon.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
