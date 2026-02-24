"use client";

import { useState } from "react";
import AiVideoStatus from "./AiVideoStatus";

export default function InventoryTable({ initialCars, deleteCarAction }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [makeFilter, setMakeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
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
        const matchesStatus = statusFilter ? car.status === statusFilter : true;

        // Feature Filter
        const matchesFeature = featureFilter ? (car.features && car.features.includes(featureFilter)) : true;

        return matchesSearch && matchesMake && matchesStatus && matchesFeature;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by model, year, or keyword..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        value={makeFilter}
                        onChange={(e) => setMakeFilter(e.target.value)}
                    >
                        <option value="">All Makes</option>
                        {uniqueMakes.map(make => (
                            <option key={make} value={make}>{make}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        value={featureFilter}
                        onChange={(e) => setFeatureFilter(e.target.value)}
                    >
                        <option value="">All Features</option>
                        {uniqueFeatures.map(feature => (
                            <option key={feature} value={feature}>{feature}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-40">
                    <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Image</th>
                            <th className="p-4 font-bold">Vehicle</th>
                            <th className="p-4 font-bold">Price</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCars.map((car) => (
                            <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    {car.main_image_url ? (
                                        <img src={car.main_image_url} className="w-16 h-12 object-cover rounded-md border border-slate-200" alt={`${car.make} ${car.model}`} />
                                    ) : (
                                        <div className="w-16 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-xl">directions_car</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-slate-900">{car.year} {car.make} {car.model}</p>
                                    <p className="text-xs text-slate-500">{new Intl.NumberFormat('en-ZA').format(car.mileage)} km • {car.transmission}</p>
                                </td>
                                <td className="p-4 font-bold text-slate-700">
                                    R {new Intl.NumberFormat('en-ZA').format(car.price)}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-md mb-2 ${car.status === 'available' ? 'bg-green-100 text-green-700' :
                                        car.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-200 text-slate-600'
                                        }`}>
                                        {car.status}
                                    </span>
                                    <div className="mt-1">
                                        <AiVideoStatus carId={car.id} videoUrl={car.video_url} />
                                    </div>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <a href={`/admin/inventory/edit/${car.id}`} className="text-slate-400 hover:text-primary transition-colors p-2" title="Edit Vehicle">
                                        <span className="material-symbols-outlined">edit</span>
                                    </a>
                                    <form action={deleteCarAction}>
                                        <input type="hidden" name="id" value={car.id} />
                                        <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors p-2" title="Delete Vehicle">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}

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
