import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BarChart3, AlertTriangle, Users, Calendar, Clock, UserCheck } from "lucide-react";
import { getStatusLabel, getStatusColor, PHASE_CONFIG, RAF_STATUSES, type StatusPhase } from "@/lib/statusConfig";

export default async function ReportsPage() {
    const supabase = createClient();

    // Fetch all cases
    const { data: cases } = await supabase
        .from("cases")
        .select("*, client:profiles!client_id(full_name), attorney:profiles!attorney_id(full_name)")
        .order("updated_at", { ascending: false });

    // Fetch status history for time analysis
    const { data: history } = await supabase
        .from("case_status_history")
        .select("*")
        .order("changed_at", { ascending: true });

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
                                                <p className="text-xs text-gray-500">{c.client?.full_name} • #{c.case_number}</p>
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
                                                <p className="text-xs text-gray-500">{c.client?.full_name}</p>
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
                                            <p className="text-xs text-gray-500">{c.client?.full_name} • {c.attorney?.full_name || 'Unassigned'}</p>
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
        </div>
    );
}
