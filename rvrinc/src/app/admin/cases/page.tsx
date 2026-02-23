import { createClient } from "@/lib/supabase/server";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getStatusLabel, getStatusColor, getStatusConfig, PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";

export default async function AdminCasesPage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Get User Role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

    // Start Query
    let query = supabase
        .from("cases")
        .select("*, client:profiles!client_id(full_name), attorney:profiles!attorney_id(full_name)");

    // Apply Filter for Attorneys
    if (profile?.role === 'attorney') {
        query = query.eq('attorney_id', user?.id!);
    }

    // Execute with Order
    const { data: cases } = await query.order("updated_at", { ascending: false });

    // Phase stats
    const phaseCounts: Record<string, number> = {};
    const clientActionCount = cases?.filter((c: any) => {
        const phase = getStatusColor(c.status);
        return phase;
    }).length || 0;

    cases?.forEach((c: any) => {
        const statusConfig = getStatusColor(c.status);
        // Count by rough phase
    });

    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Case Management</h1>
                    <p className="text-slate-500 mt-2">View and manage all legal matters.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/reports">
                        <Button variant="outline">📊 Reports</Button>
                    </Link>
                    <Link href="/admin/cases/new">
                        <Button variant="brand"><Plus className="w-4 h-4 mr-2" /> New Case</Button>
                    </Link>
                </div>
            </div>

            {/* Phase Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {phases.map(([phase, config]) => {
                    const count = cases?.filter((c: any) => {
                        const sc = getStatusConfig(c.status);
                        return sc?.phase === phase;
                    }).length || 0;
                    return (
                        <div key={phase} className={`${config.bgColor} rounded-lg p-3 text-center`}>
                            <p className={`text-2xl font-bold ${config.textColor}`}>{count}</p>
                            <p className={`text-xs font-medium ${config.textColor} opacity-80`}>{config.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Case Details</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Attorney</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Updated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cases?.map((c: any) => {
                                const { bgColor, textColor } = getStatusColor(c.status);
                                const label = getStatusLabel(c.status);
                                return (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{c.title}</p>
                                            <p className="text-xs text-gray-500">#{c.case_number}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {c.client?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-slate-700">{c.client?.full_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {c.attorney?.full_name || <span className="text-orange-500 italic">Unassigned</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold tracking-wide ${bgColor} ${textColor}`}>
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(c.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/cases/${c.id}`}>
                                                <Button variant="ghost" size="sm">Manage</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!cases || cases.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No cases found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
