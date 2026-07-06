"use client";

import { useState } from "react";
import AiVideoStatus from "./AiVideoStatus";
import SocialPostButton from "./SocialPostButton";
import MarkSoldButton from "./MarkSoldButton";
import SeoFixButton from "./SeoFixButton";
import DeleteVehicleButton from "./DeleteVehicleButton";
import SyndicateButtons from "./SyndicateButtons";

export default function InventoryTable({ initialCars, deleteCarAction }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [makeFilter, setMakeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("active_only");
    const [featureFilter, setFeatureFilter] = useState("");

    // Extract unique makes and features for dropdowns
    const uniqueMakes = [...new Set(initialCars.map(c => c.make))].filter(Boolean).sort();

    // Extract all unique features for the dropdown
    const allFeatures = initialCars.reduce((acc, car) => {
        if (car.features && Array.isArray(car.features)) {
            car.features.forEach(f => acc.add(f));
        }
        return acc;
    }, new Set());
    const uniqueFeatures = [...allFeatures].sort();

    // Filter logic
    const filteredCars = initialCars.filter(car => {
        // Text Search (Model, Year, Description)
        const searchString = `${car.year} ${car.make} ${car.model} ${car.description || ""}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());

        // Make Filter
        const matchesMake = makeFilter ? car.make === makeFilter : true;

        // Status Filter
        let matchesStatus = true;
        if (statusFilter === "active_only") {
            // Hide old sold cars if not actively searching
            if (!searchTerm && car.status === "sold") {
                const soldAtStr = car.sales?.[0]?.sold_at;
                if (soldAtStr) {
                    const soldAtDate = new Date(soldAtStr);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    if (soldAtDate < thirtyDaysAgo) {
                        matchesStatus = false;
                    }
                } else {
                    matchesStatus = false; // If no date, hide it to be safe
                }
            }
        } else if (statusFilter) {
            matchesStatus = car.status === statusFilter;
        }

        // Feature Filter
        const matchesFeature = featureFilter ? (car.features && car.features.includes(featureFilter)) : true;

        return matchesSearch && matchesMake && matchesStatus && matchesFeature;
    });

    return (
        <div className="space-y-8">
            {/* Search and Filters Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 relative z-10">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by model, year, or keyword..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-56">
                    <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all font-medium"
                        value={makeFilter}
                        onChange={(e) => setMakeFilter(e.target.value)}
                    >
                        <option value="">All Makes</option>
                        {uniqueMakes.map(make => (
                            <option key={make} value={make}>{make}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-56">
                    <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all font-medium"
                        value={featureFilter}
                        onChange={(e) => setFeatureFilter(e.target.value)}
                    >
                        <option value="">All Features</option>
                        {uniqueFeatures.map(feature => (
                            <option key={feature} value={feature}>{feature}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-56">
                    <select
                        className="w-full px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer hover:bg-primary/20 transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="active_only">Active & Recent</option>
                        <option value="">Show All</option>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                    </select>
                </div>
            </div>

            {/* Total Results */}
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredCars.length} Vehicle{filteredCars.length !== 1 ? 's' : ''}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">
                            <th className="p-6 w-[104px]">Image</th>
                            <th className="p-6 w-[34%]">Vehicle</th>
                            <th className="p-6 w-[150px] whitespace-nowrap">Price</th>
                            <th className="p-6 w-[150px]">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(() => {
                            const renderRow = (car) => (
                                <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6">
                                        {car.main_image_url ? (
                                            <img src={car.main_image_url} className="w-24 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" alt={`${car.make} ${car.model}`} />
                                        ) : (
                                            <div className="w-24 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-2xl">directions_car</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-slate-900 text-base tracking-tight">{car.year} {car.make} {car.model}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{new Intl.NumberFormat('en-ZA').format(car.mileage)} km • {car.transmission}</p>
                                    </td>
                                    <td className="p-6 font-black text-slate-900 text-lg whitespace-nowrap">
                                        R {new Intl.NumberFormat('en-ZA').format(car.price)}
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full mb-2 ${car.status === 'available' ? 'bg-green-100 text-green-700' :
                                            car.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-200 text-slate-600'
                                            }`}>
                                            {car.status}
                                        </span>
                                        <div className="mt-1">
                                            <AiVideoStatus carId={car.id} videoUrl={car.video_url} />
                                        </div>
                                        {car.social_shared_at && (
                                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-200">
                                                <span className="material-symbols-outlined text-[12px]">share</span>
                                                Shared
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6 flex justify-end items-center gap-2">
                                        <SyndicateButtons car={car} />
                                        <SeoFixButton car={car} />
                                        <SocialPostButton car={car} />
                                        <MarkSoldButton car={car} />
                                        <a href={`/api/admin/flyer/${car.id}`} download className="text-slate-400 hover:text-primary transition-colors p-2" title="Download A4 Flyer">
                                            <span className="material-symbols-outlined">wallpaper</span>
                                        </a>
                                        <a href={`/admin/inventory/edit/${car.id}`} className="text-slate-400 hover:text-primary transition-colors p-2" title="Edit Vehicle">
                                            <span className="material-symbols-outlined">edit</span>
                                        </a>
                                        <DeleteVehicleButton car={car} deleteCarAction={deleteCarAction} />
                                    </td>
                                </tr>
                            );
                            const activeCars = filteredCars.filter(c => c.status !== 'sold');
                            const soldCars = filteredCars.filter(c => c.status === 'sold');
                            return (
                                <>
                                    {activeCars.map(renderRow)}
                                    {soldCars.length > 0 && (
                                        <tr key="sold-heading">
                                            <td colSpan="5" className="bg-black text-primary font-black uppercase tracking-[0.3em] text-xs p-4">Sold</td>
                                        </tr>
                                    )}
                                    {soldCars.map(renderRow)}
                                </>
                            );
                        })()}

                        {filteredCars.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    No vehicles match your search filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
