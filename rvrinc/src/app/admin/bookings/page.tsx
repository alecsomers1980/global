import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default async function AdminBookingsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch all appointments with client and attorney info
    const { data: appointments } = await supabase
        .from("appointments")
        .select("*, client:profiles!client_id(full_name, email), attorney:profiles!attorney_id(full_name)")
        .order("start_time", { ascending: false });

    const upcoming = appointments?.filter(
        (a: any) => new Date(a.start_time) >= new Date() && a.status !== "cancelled"
    ) || [];
    const past = appointments?.filter(
        (a: any) => new Date(a.start_time) < new Date() || a.status === "cancelled"
    ) || [];

    const statusIcon = (status: string) => {
        switch (status) {
            case "confirmed": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            pending: "bg-yellow-100 text-yellow-800",
        };
        return (
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.pending}`}>
                {statusIcon(status)}
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">Bookings</h1>
                <p className="text-gray-500 mt-2">Manage all client consultation appointments.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{appointments?.length || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{upcoming.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Past / Cancelled</p>
                    <p className="text-3xl font-bold text-gray-400 mt-1">{past.length}</p>
                </div>
            </div>

            {/* Upcoming */}
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-gold" /> Upcoming Appointments
                </h2>
                {upcoming.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Date & Time</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Client</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Attorney</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {upcoming.map((apt: any) => (
                                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <div className="font-medium text-slate-900">
                                                        {format(new Date(apt.start_time), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(apt.start_time), "HH:mm")} - {format(new Date(apt.end_time), "HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <div className="font-medium">{apt.client?.full_name || "N/A"}</div>
                                                    <div className="text-gray-400 text-xs">{apt.client?.email || ""}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {apt.attorney?.full_name || "Unassigned"}
                                        </td>
                                        <td className="px-6 py-4">{statusBadge(apt.status)}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                                            {apt.notes || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No upcoming appointments</p>
                    </div>
                )}
            </div>

            {/* Past */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Past / Cancelled</h2>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Client</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Attorney</th>
                                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {past.map((apt: any) => (
                                    <tr key={apt.id} className="text-gray-500">
                                        <td className="px-6 py-3">{format(new Date(apt.start_time), "MMM d, yyyy HH:mm")}</td>
                                        <td className="px-6 py-3">{apt.client?.full_name || "N/A"}</td>
                                        <td className="px-6 py-3">{apt.attorney?.full_name || "Unassigned"}</td>
                                        <td className="px-6 py-3">{statusBadge(apt.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
