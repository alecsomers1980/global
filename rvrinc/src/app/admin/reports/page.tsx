import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BarChart3, AlertTriangle, Users, Calendar, Clock, UserCheck, History } from "lucide-react";
import { getStatusLabel, getStatusColor, PHASE_CONFIG, RAF_STATUSES, type StatusPhase } from "@/lib/statusConfig";
import { getBranchLabel } from "@/lib/branch";
import { fetchAllRows } from "@/lib/fetchAllRows";

interface Props {
    searchParams: { branch?: string; changedBy?: string; dateFrom?: string; dateTo?: string };
}

export default async function ReportsPage({ searchParams }: Props) {
    const supabase = createClient();
    const branchFilter = searchParams.branch || "";
    const changedByFilter = searchParams.changedBy || "";
    const dateFromFilter = searchParams.dateFrom || "";
    const dateToFilter = searchParams.dateTo || "";

    // Get current user's role and branch
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, branch")
        .eq("id", user?.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const effectiveBranch = isAdmin ? branchFilter : (profile?.branch || '');

    // Fetch all cases (with branch filter for non-admin)
    const cases = await fetchAllRows(() => {
        let q = supabase
            .from("cases")
            .select("*, attorney:profiles!attorney_id(full_name)");
        if (effectiveBranch) q = q.eq("branch", effectiveBranch);
        return q.order("updated_at", { ascending: false }).order("id", { ascending: true });
    });

    // Fetch status history for time analysis
    let historyQuery = supabase
        .from("case_status_history")
        .select("*");
    if (effectiveBranch) historyQuery = historyQuery.eq('cases.branch', effectiveBranch);
    const { data: history } = await historyQuery.order("changed_at", { ascending: true });

    // Fetch status history with changer details (audit trail)
    let activityQuery = supabase
        .from("case_status_history")
        .select("*, cases!inner(case_number, title, branch), changed_by_profile:profiles!changed_by(full_name)")
        .order("changed_at", { ascending: false });

    if (effectiveBranch) activityQuery = activityQuery.eq('cases.branch', effectiveBranch);
    if (changedByFilter) activityQuery = activityQuery.eq('changed_by', changedByFilter);
    if (dateFromFilter) activityQuery = activityQuery.gte('changed_at', dateFromFilter + 'T00:00:00');
    if (dateToFilter) activityQuery = activityQuery.lte('changed_at', dateToFilter + 'T23:59:59');

    const { data: recentActivity } = await activityQuery.limit(200);

    // Fetch distinct users who made changes for filter dropdown
    const { data: changedByUsers } = await supabase
        .from("case_status_history")
        .select("changed_by, changed_by_profile:profiles!changed_by(full_name)")
        .order("changed_at", { ascending: false })
        .limit(500);

    const uniqueChangers: [string, string][] = changedByUsers
        ? Array.from(new Map(
            changedByUsers
                .filter((u: any) => u.changed_by)
                .map((u: any) => [u.changed_by as string, (u.changed_by_profile as any)?.full_name || 'Unknown'] as [string, string])
        ).entries())
        : [];

    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];
    const now = new Date();

    // ---- REPORT 1: Pipeline Overview ----
    const pipelineData = phases.map(([phase, config]) => {
        const count = cases?.filter((c: any) => {
            const statusConfig = RAF_STATUSES.find(s => s.slug === c.status);
            return statusConfig?.phase === phase;
        }).length || 0;
        return { phase, ...config, count };
    });
    const totalCases = cases?.length || 0;

    // ---- REPORT 2: Overdue Cases ----
    const overdueCases = cases?.filter((c: any) => c.diary_date && new Date(c.diary_date) < now) || [];

    // ---- REPORT 3: Client Action Pending ----
    const clientActionStatuses = RAF_STATUSES.filter(s => s.requiresClientAction).map(s => s.slug);
    const clientActionCases = cases?.filter((c: any) => clientActionStatuses.includes(c.status)) || [];

    // ---- REPORT 4: Attorney Workload ----
    const attorneyMap: Record<string, { name: string; total: number; phases: Record<string, number> }> = {};
    cases?.forEach((c: any) => {
        const name = c.attorney?.full_name || "Unassigned";
        if (!attorneyMap[name]) {
            attorneyMap[name] = { name, total: 0, phases: {} };
        }
        attorneyMap[name].total++;
        const statusConfig = RAF_STATUSES.find(s => s.slug === c.status);
        const phase = statusConfig?.phase || 'unknown';
        attorneyMap[name].phases[phase] = (attorneyMap[name].phases[phase] || 0) + 1;
    });
    const attorneys = Object.values(attorneyMap).sort((a, b) => b.total - a.total);

    // ---- REPORT 5: Court Calendar ----
    const courtCases = cases?.filter((c: any) => c.scheduled_date && new Date(c.scheduled_date) >= now)
        .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()) || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/cases">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-brand-gold mb-2">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cases
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
                    <p className="text-slate-500 mt-2">Overview of all RAF claims across the firm.</p>
                </div>
            </div>

            {/* REPORT 1: Pipeline Overview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-brand-gold" /> Pipeline Overview
                    <span className="text-sm font-normal text-gray-500 ml-2">({totalCases} total cases)</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {pipelineData.map((p) => (
                        <div key={p.phase} className={`${p.bgColor} rounded-xl p-4 text-center transition-transform hover:scale-105`}>
                            <p className={`text-3xl font-bold ${p.textColor}`}>{p.count}</p>
                            <p className={`text-xs font-medium ${p.textColor} opacity-80 mt-1`}>{p.label}</p>
                            {totalCases > 0 && (
                                <div className="mt-2 bg-white/50 rounded-full h-1.5">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${(p.count / totalCases) * 100}%`, backgroundColor: p.color }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* REPORT 2 & 3: Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue Cases */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" /> Overdue Follow-Ups
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">{overdueCases.length}</span>
                    </h2>
                    {overdueCases.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {overdueCases.map((c: any) => {
                                const daysOverdue = Math.floor((now.getTime() - new Date(c.diary_date).getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <Link key={c.id} href={`/admin/cases/${c.id}`} className="block p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{c.title}</p>
                                                <p className="text-xs text-gray-500">{c.case_number}</p>
                                            </div>
                                            <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-0.5 rounded">{daysOverdue}d overdue</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-6 text-sm">No overdue cases! ✓</p>
                    )}
                </div>

                {/* Client Action Pending */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <UserCheck className="w-5 h-5 text-amber-500" /> Awaiting Client Action
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{clientActionCases.length}</span>
                    </h2>
                    {clientActionCases.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {clientActionCases.map((c: any) => {
                                const { bgColor, textColor } = getStatusColor(c.status);
                                return (
                                    <Link key={c.id} href={`/admin/cases/${c.id}`} className="block p-3 bg-amber-50 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{c.title}</p>
                                                <p className="text-xs text-gray-500">{c.case_number}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${bgColor} ${textColor}`}>
                                                {getStatusLabel(c.status)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-6 text-sm">No pending client actions! ✓</p>
                    )}
                </div>
            </div>

            {/* REPORT 4: Attorney Workload */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-brand-gold" /> Attorney Workload
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 text-left">Attorney</th>
                                <th className="px-4 py-3 text-center">Total</th>
                                {phases.map(([phase, config]) => (
                                    <th key={phase} className="px-4 py-3 text-center">
                                        <span className={`text-xs ${config.textColor}`}>{config.label}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attorneys.map((att) => (
                                <tr key={att.name} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{att.name}</td>
                                    <td className="px-4 py-3 text-center font-bold text-brand-navy">{att.total}</td>
                                    {phases.map(([phase, config]) => (
                                        <td key={phase} className="px-4 py-3 text-center">
                                            <span className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${att.phases[phase] ? config.bgColor + ' ' + config.textColor : 'text-gray-300'}`}>
                                                {att.phases[phase] || '—'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REPORT 5: Court Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-brand-gold" /> Upcoming Court Dates
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{courtCases.length}</span>
                </h2>
                {courtCases.length > 0 ? (
                    <div className="space-y-3">
                        {courtCases.map((c: any) => {
                            const date = new Date(c.scheduled_date);
                            const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            const isUrgent = daysUntil <= 7;
                            return (
                                <Link key={c.id} href={`/admin/cases/${c.id}`} className={`block p-4 rounded-lg border transition-colors ${isUrgent ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800">{c.title}</p>
                                            <p className="text-xs text-gray-500">{c.attorney?.full_name || 'Unassigned'}</p>
                                            <p className="text-xs mt-1">
                                                <span className={`font-bold ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
                                                    {date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </p>
                                        </div>
                                        <span className={`text-sm font-bold px-3 py-1 rounded-lg ${isUrgent ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
                                            {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-6 text-sm">No upcoming court dates.</p>
                )}
            </div>

            {/* REPORT 6: Recent Activity (Audit Trail) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-brand-gold" /> Audit Trail — Case Status Changes
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{recentActivity?.length || 0} records</span>
                </h2>

                {/* Audit Filters */}
                <form action="/admin/reports" method="GET" className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {isAdmin && (
                        <select name="branch" defaultValue={branchFilter} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                            <option value="">All Branches</option>
                            <option value="pretoria">Pretoria</option>
                            <option value="marble-hall">Marble Hall</option>
                        </select>
                    )}
                    <select name="changedBy" defaultValue={changedByFilter} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                        <option value="">All Users</option>
                        {uniqueChangers.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">From:</span>
                        <input type="date" name="dateFrom" defaultValue={dateFromFilter} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">To:</span>
                        <input type="date" name="dateTo" defaultValue={dateToFilter} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Apply Filters</Button>
                    {(branchFilter || changedByFilter || dateFromFilter || dateToFilter) && (
                        <Link href="/admin/reports">
                            <Button type="button" variant="ghost" size="sm">Clear</Button>
                        </Link>
                    )}
                </form>

                {recentActivity && recentActivity.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 text-left">Case</th>
                                    <th className="px-4 py-3 text-left">Branch</th>
                                    <th className="px-4 py-3 text-left">Status Change</th>
                                    <th className="px-4 py-3 text-left">Updated By</th>
                                    <th className="px-4 py-3 text-left">Date & Time</th>
                                    <th className="px-4 py-3 text-left">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentActivity.map((entry: any) => {
                                    const { bgColor, textColor } = getStatusColor(entry.new_status);
                                    return (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/cases/${entry.case_id}`} className="hover:text-brand-gold">
                                                    <span className="font-semibold text-slate-800">{entry.cases?.case_number}</span>
                                                    <span className="text-gray-400 ml-1">— {entry.cases?.title}</span>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    entry.cases?.branch === 'marble-hall' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {getBranchLabel(entry.cases?.branch || 'pretoria')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {entry.old_status && (
                                                        <span className="text-xs text-gray-400 line-through">{getStatusLabel(entry.old_status)}</span>
                                                    )}
                                                    {entry.old_status && <span className="text-gray-300">→</span>}
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${bgColor} ${textColor}`}>
                                                        {getStatusLabel(entry.new_status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{entry.changed_by_profile?.full_name || "System"}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(entry.changed_at).toLocaleString("en-ZA")}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{entry.notes || "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-6 text-sm">No activity recorded matching your filters.</p>
                )}
            </div>
        </div>
    );
}
