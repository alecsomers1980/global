import { createClient } from "@/lib/supabase/server";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getStatusLabel, getStatusColor, getStatusConfig, PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";
import { getCaseStatuses } from "@/lib/statuses";
import { getBranchLabel } from "@/lib/branch";
import CaseSearch from "@/components/admin/CaseSearch";
import { fetchAllRows } from "@/lib/fetchAllRows";

const SORT_FIELDS = [
    { key: "case_number", label: "Case #" },
    { key: "title", label: "Client" },
    { key: "branch", label: "Branch" },
    { key: "status", label: "Status" },
    { key: "updated_at", label: "Updated" },
];

interface Props {
    searchParams: { search?: string; phase?: string; branch?: string; sort?: string; order?: string };
}

function SortHeader({ field, label, currentSort, currentOrder, params }: {
    field: string; label: string; currentSort: string; currentOrder: string;
    params: URLSearchParams;
}) {
    const isActive = currentSort === field;
    const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";
    const p = new URLSearchParams(params);
    p.set("sort", field);
    p.set("order", nextOrder);
    const qs = p.toString();
    return (
        <a href={`/admin/cases${qs ? `?${qs}` : ""}`} className="inline-flex items-center gap-1 hover:text-brand-navy transition-colors group">
            {label}
            {isActive ? (
                currentOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            ) : (
                <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
        </a>
    );
}

export default async function AdminCasesPage({ searchParams }: Props) {
    const supabase = createClient();
    const search = searchParams.search || "";
    const phaseFilter = searchParams.phase || "";
    const branchFilter = searchParams.branch || "";
    const sortField = searchParams.sort || "case_number";
    const sortOrder = (searchParams.order || "asc") as "asc" | "desc";

    const statuses = await getCaseStatuses();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, branch")
        .eq("id", user?.id)
        .single();

    // Staff/attorney locked to their branch; admins can filter
    const isAdmin = profile?.role === 'admin';
    const effectiveBranch = isAdmin ? branchFilter : (profile?.branch || '');

    // Fetch attorneys for name lookup (avoid PostgREST embed issues under RLS)
    const { data: allAttorneys } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("role", ["attorney", "admin", "staff"]);

    const attorneyMap = new Map<string, string>();
    allAttorneys?.forEach((a: any) => attorneyMap.set(a.id, a.full_name));

    // Fetch all cases for phase counts (unfiltered except branch)
    const allCases = await fetchAllRows(() => {
        let q = supabase.from("cases").select("id, status, branch");
        if (effectiveBranch) q = q.eq("branch", effectiveBranch);
        return q.order("id", { ascending: true });
    });

    // Build filtered query (no embed — join attorney name in JS)
    const rawCases = await fetchAllRows(() => {
        let q = supabase.from("cases").select("*");

        if (effectiveBranch) {
            q = q.eq("branch", effectiveBranch);
        }

        // Apply search filter across multiple columns
        if (search) {
            q = q.or(
                `title.ilike.%${search}%,case_number.ilike.%${search}%,id_number.ilike.%${search}%,description.ilike.%${search}%,raf_ref.ilike.%${search}%`
            );
        }

        // Apply phase filter
        if (phaseFilter) {
            const phaseStatuses = statuses.filter(s => s.phase === phaseFilter).map(s => s.slug);
            if (phaseStatuses.length > 0) {
                q = q.in("status", phaseStatuses);
            }
        }

        return q.order(sortField, { ascending: sortOrder === "asc" }).order("id", { ascending: true });
    });

    // Attach attorney names from our lookup map
    const cases = rawCases?.map((c: any) => ({
        ...c,
        attorney: { full_name: attorneyMap.get(c.attorney_id) || null },
    })) || [];

    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];

    // Base params for sort/filter links (preserve current filters)
    const baseParams = new URLSearchParams();
    if (search) baseParams.set("search", search);
    if (phaseFilter) baseParams.set("phase", phaseFilter);
    if (branchFilter) baseParams.set("branch", branchFilter);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Case Management</h1>
                    <p className="text-slate-500 mt-2">
                        {search ? `Search results for "${search}"` : "View and manage all legal matters."}
                        {cases && <span className="ml-2 text-sm">({cases.length} cases)</span>}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/reports">
                        <Button variant="outline">Reports</Button>
                    </Link>
                    <Link href="/admin/cases/new">
                        <Button variant="brand"><Plus className="w-4 h-4 mr-2" /> New Case</Button>
                    </Link>
                </div>
            </div>

            {/* Phase Overview Cards — clickable filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {phases.map(([phase, config]) => {
                    const count = allCases?.filter((c: any) => {
                        const sc = getStatusConfig(c.status, statuses);
                        return sc?.phase === phase;
                    }).length || 0;
                    const isActive = phaseFilter === phase;
                    return (
                        <Link
                            key={phase}
                            href={`/admin/cases?${search ? `search=${encodeURIComponent(search)}&` : ""}phase=${isActive ? "" : phase}`}
                            className={`${config.bgColor} rounded-lg p-3 text-center transition-all hover:scale-105 ${isActive ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                        >
                            <p className={`text-2xl font-bold ${config.textColor}`}>{count}</p>
                            <p className={`text-xs font-medium ${config.textColor} opacity-80`}>{config.label}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center flex-wrap">
                <CaseSearch initialSearch={search} phaseFilter={phaseFilter} branchFilter={branchFilter} />
                {isAdmin && (
                    <form action="/admin/cases" method="GET" className="flex gap-2">
                        {search && <input type="hidden" name="search" value={search} />}
                        {phaseFilter && <input type="hidden" name="phase" value={phaseFilter} />}
                        <select
                            name="branch"
                            defaultValue={branchFilter}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white"
                        >
                            <option value="">All Branches</option>
                            <option value="pretoria">Pretoria</option>
                            <option value="marble-hall">Marble Hall</option>
                        </select>
                        <Button type="submit" variant="outline" size="sm">Filter</Button>
                    </form>
                )}
                {(search || phaseFilter || branchFilter) && (
                    <Link href="/admin/cases">
                        <Button variant="ghost" size="sm">Clear All</Button>
                    </Link>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">
                                    <SortHeader field="case_number" label="Case #" currentSort={sortField} currentOrder={sortOrder} params={baseParams} />
                                </th>
                                <th className="px-6 py-4">
                                    <SortHeader field="title" label="Client" currentSort={sortField} currentOrder={sortOrder} params={baseParams} />
                                </th>
                                <th className="px-6 py-4">
                                    <SortHeader field="branch" label="Branch" currentSort={sortField} currentOrder={sortOrder} params={baseParams} />
                                </th>
                                <th className="px-6 py-4">Attorney</th>
                                <th className="px-6 py-4">
                                    <SortHeader field="status" label="Status" currentSort={sortField} currentOrder={sortOrder} params={baseParams} />
                                </th>
                                <th className="px-6 py-4">
                                    <SortHeader field="updated_at" label="Updated" currentSort={sortField} currentOrder={sortOrder} params={baseParams} />
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cases?.map((c: any) => {
                                const { bgColor, textColor } = getStatusColor(c.status, statuses);
                                const label = getStatusLabel(c.status, statuses);
                                return (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-xs font-mono text-gray-600">{c.case_number}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{c.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                c.branch === 'marble-hall' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {getBranchLabel(c.branch || 'pretoria')}
                                            </span>
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {search ? "No cases match your search." : "No cases found."}
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
