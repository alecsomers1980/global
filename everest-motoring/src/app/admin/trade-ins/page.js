import { createClient } from "@/utils/supabase/server";
import TradeInStatusSelector from "./TradeInStatusSelector";

export const metadata = {
    title: "Trade-In Requests | Everest Admin",
};

export default async function TradeInsPage() {
    const supabase = await createClient();

    // Fetch all Trade-In Requests
    const { data: requests } = await supabase
        .from('value_my_car_requests')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Trade-In Valuations</h1>
                    <p className="text-slate-500 mt-1">Review customer requests from the "Value My Car" landing page.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Client Contact</th>
                            <th className="p-4 font-bold col-span-2">Customer Vehicle Details</th>
                            <th className="p-4 font-bold">Registration Plate</th>
                            <th className="p-4 font-bold">Date Received</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requests && requests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-slate-900">{req.client_name}</p>
                                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                        {req.client_phone}
                                    </p>
                                </td>

                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400">
                                            <span className="material-symbols-outlined">car_tag</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{req.year} {req.make_model}</p>
                                            <p className="text-xs text-slate-500 font-medium">Odometer: <span className="text-slate-700">{new Intl.NumberFormat('en-ZA').format(req.mileage)} km</span></p>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <span className="font-mono bg-yellow-100 text-yellow-800 font-bold px-3 py-1.5 rounded border border-yellow-200 shadow-sm uppercase tracking-wider text-sm">
                                        {req.registration_number}
                                    </span>
                                </td>

                                <td className="p-4 text-sm text-slate-600">
                                    {new Date(req.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>

                                <td className="p-4">
                                    <TradeInStatusSelector requestId={req.id} currentStatus={req.status} />
                                </td>

                                <td className="p-4 flex flex-col items-end gap-2 text-right">
                                    {/* WhatsApp Action */}
                                    <a
                                        href={`https://wa.me/${req.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${req.client_name}, this is Everest Motoring reaching out regarding your trade-in request for the ${req.year} ${req.make_model} (${req.registration_number}). How can we help you today?`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors px-3 py-1.5 rounded-md font-medium text-sm flex items-center justify-center gap-1 w-full max-w-[160px]"
                                    >
                                        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                        </svg>
                                        WhatsApp
                                    </a>

                                    <a href={`tel:${req.client_phone}`} className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-md font-medium text-sm flex items-center justify-center gap-1 w-full max-w-[160px]">
                                        <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                                        Call Client
                                    </a>
                                </td>
                            </tr>
                        ))}

                        {(!requests || requests.length === 0) && (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-500 bg-slate-50/50">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">sell</span>
                                    <p>No trade-in valuations requested yet.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
