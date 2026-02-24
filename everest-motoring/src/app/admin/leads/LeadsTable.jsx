"use client";

import { useState } from "react";
import { inviteClientAction } from "./actions";

export default function LeadsTable({ initialLeads }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Filter logic
    const filteredLeads = initialLeads.filter(lead => {
        // Text Search (Client Name, Phone, Email, Car Make, Car Model)
        const carDetails = lead.cars ? `${lead.cars.year} ${lead.cars.make} ${lead.cars.model}` : "";
        const searchString = `${lead.client_name} ${lead.client_phone} ${lead.client_email || ""} ${carDetails}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());

        // Status Filter
        const matchesStatus = statusFilter ? lead.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by client name, email, phone, or vehicle..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="document_collection">Document Collection</option>
                        <option value="finance_pending">Finance Pending</option>
                        <option value="closed_won">Closed Won</option>
                        <option value="closed_lost">Closed Lost</option>
                    </select>
                </div>
            </div>

            {/* Total Results */}
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredLeads.length} Inquir{filteredLeads.length !== 1 ? 'ies' : 'y'}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Client Details</th>
                            <th className="p-4 font-bold">Vehicle of Interest</th>
                            <th className="p-4 font-bold">Inquiry Date</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-slate-900">{lead.client_name}</p>
                                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                        {lead.client_phone}
                                    </p>
                                    {lead.client_email && (
                                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[16px]">mail</span>
                                            {lead.client_email}
                                        </p>
                                    )}
                                    <div className="mt-3">
                                        {lead.profiles ? (
                                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[14px]">link</span>
                                                Ref: {lead.profiles.first_name} {lead.profiles.last_name} ({lead.profiles.affiliate_code})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[14px]">public</span>
                                                Organic Direct
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {lead.cars ? (
                                        <div className="flex items-center gap-3">
                                            {lead.cars.main_image_url ? (
                                                <img src={lead.cars.main_image_url} className="w-12 h-10 object-cover rounded shadow-sm border border-slate-200" alt="Car" />
                                            ) : (
                                                <div className="w-12 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined text-sm">directions_car</span>
                                                </div>
                                            )}
                                            <div>
                                                <a href={`/inventory/${lead.car_id}`} target="_blank" className="font-bold text-primary hover:underline block">
                                                    {lead.cars.year} {lead.cars.make} {lead.cars.model}
                                                </a>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">R {new Intl.NumberFormat('en-ZA').format(lead.cars.price)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">Vehicle no longer found</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-slate-600 text-nowrap">
                                    {new Date(lead.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-md ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                                            lead.status === 'closed_won' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-200 text-slate-600'
                                        }`}>
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4 flex flex-col items-end gap-2 text-right">
                                    <a
                                        href={`https://wa.me/${lead.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.client_name}, this is Everest Motoring reaching out regarding your inquiry for the ${lead.cars?.year || ''} ${lead.cars?.make || ''} ${lead.cars?.model || ''}. How can we help you today?`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors px-3 py-1.5 rounded-md font-medium text-sm flex items-center justify-center gap-1 w-full max-w-[160px]"
                                    >
                                        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                        </svg>
                                        WhatsApp
                                    </a>

                                    <a href={`tel:${lead.client_phone}`} className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-md font-medium text-sm flex items-center justify-center gap-1 w-full max-w-[160px]">
                                        <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                                        Call Client
                                    </a>

                                    {!lead.client_id && lead.client_email && lead.status !== 'finance_pending' && (
                                        <form action={inviteClientAction} className="w-full max-w-[160px]">
                                            <input type="hidden" name="leadId" value={lead.id} />
                                            <input type="hidden" name="clientName" value={lead.client_name} />
                                            <input type="hidden" name="clientEmail" value={lead.client_email} />
                                            <button type="submit" className="w-full bg-slate-800 text-white hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-md font-medium text-xs flex items-center justify-center gap-1 shadow-sm border border-slate-900">
                                                <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                                                Invite & Request Docs
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-500 bg-slate-50/50">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inbox</span>
                                    <p>No vehicle inquiries match your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
