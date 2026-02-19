import { createClient } from "@/lib/supabase/server";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Case Management</h1>
                    <p className="text-slate-500 mt-2">View and manage all legal matters.</p>
                </div>
                <Link href="/admin/cases/new">
                    <Button variant="brand"><Plus className="w-4 h-4 mr-2" /> New Case</Button>
                </Link>
            </div>

            {/* Filters (Conceptual) */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
                <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter Status</Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Case Details</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Assigned Attorney</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cases?.map((c: any) => (
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
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                            c.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                c.status === 'litigation' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm">Manage</Button>
                                    </td>
                                </tr>
                            ))}
                            {(!cases || cases.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
