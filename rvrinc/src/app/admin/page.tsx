import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Briefcase, Users, FileText, Calendar, ArrowUpRight, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getPrescriptionInfo, type PrescriptionInfo } from "@/lib/prescription";

export default async function AdminDashboard() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Get User Role & Branch
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, branch")
        .eq("id", user?.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const effectiveBranch = isAdmin ? null : (profile?.branch || '');

    // 1. Cases Stat
    let casesQuery = supabase.from("cases").select("id");
    if (effectiveBranch) casesQuery = casesQuery.eq('branch', effectiveBranch);
    const { data: allCases } = await casesQuery;
    const casesCount = allCases?.length || 0;

    // 2. Clients Stat
    const { data: clients } = await supabase.from("profiles").select("id").eq('role', 'client');
    const clientsCount = clients?.length || 0;

    // 3. Documents Stat
    const { data: allDocs } = await supabase.from("documents").select("id");
    const documentsCount = allDocs?.length || 0;

    // 4. Pending Appointments
    const { data: pendingApps } = await supabase.from("appointments").select("id").eq('status', 'pending');
    const pendingAppointments = pendingApps?.length || 0;

    // 5. Cases with approaching prescription deadlines
    const { data: prescriptionCases } = await supabase
        .from("cases")
        .select("id, case_number, title, accident_date, status")
        .not("accident_date", "is", null)
        .neq("status", "closed")
        .order("accident_date", { ascending: true });

    const atRiskCases = (prescriptionCases || [])
        .map((c: any) => ({ ...c, prescription: getPrescriptionInfo(c.accident_date, c.status) }))
        .filter((c: any) => c.prescription !== null)
        .sort((a: any, b: any) => a.prescription.daysRemaining - b.prescription.daysRemaining);

    // 6. Recent Cases Table
    let recentCasesQuery = supabase
        .from("cases")
        .select("id, case_number, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    if (effectiveBranch) recentCasesQuery = recentCasesQuery.eq('branch', effectiveBranch);
    const { data: recentCases } = await recentCasesQuery;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500 mt-2">Overview of firm activity and pending tasks.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{casesCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clientsCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentsCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-brand-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-brand-navy">{pendingAppointments || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Prescription Deadline Alerts */}
            {atRiskCases.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl font-bold text-slate-800">Prescription Alerts</h2>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">{atRiskCases.length}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {atRiskCases.map((c: any) => {
                            const p = c.prescription as PrescriptionInfo;
                            const isExpired = p.risk === "expired";
                            const isCritical = p.risk === "critical";
                            return (
                                <Link key={c.id} href={`/admin/cases/${c.id}`}>
                                    <div className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                        isExpired ? "bg-red-50 border-red-300" :
                                        isCritical ? "bg-red-50 border-red-200" :
                                        p.risk === "warning" ? "bg-orange-50 border-orange-200" :
                                        "bg-yellow-50 border-yellow-200"
                                    }`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{c.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{c.case_number}</p>
                                            </div>
                                            <Clock className={`w-4 h-4 flex-shrink-0 ml-2 ${
                                                isExpired || isCritical ? "text-red-500" :
                                                p.risk === "warning" ? "text-orange-500" : "text-yellow-500"
                                            }`} />
                                        </div>
                                        <div className={`mt-2 text-xs font-bold ${
                                            isExpired ? "text-red-700" :
                                            isCritical ? "text-red-600" :
                                            p.risk === "warning" ? "text-orange-600" : "text-yellow-600"
                                        }`}>
                                            {p.label}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        isExpired ? "bg-red-500 w-full" :
                                                        isCritical ? "bg-red-500" :
                                                        p.risk === "warning" ? "bg-orange-500" : "bg-yellow-500"
                                                    }`}
                                                    style={{ width: isExpired ? "100%" : `${Math.max(5, 100 - (p.daysRemaining / 90) * 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${
                                                isExpired ? "text-red-600" :
                                                isCritical ? "text-red-500" : "text-gray-500"
                                            }`}>
                                                {isExpired ? `${Math.abs(p.daysRemaining)}d overdue` : `${p.daysRemaining}d left`}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Cases */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Recent Cases</h2>
                        <Link href="/admin/cases">
                            <Button variant="ghost" size="sm">View All <ArrowUpRight className="w-4 h-4 ml-1" /></Button>
                        </Link>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentCases?.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-slate-800">{c.title}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                c.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/cases/new">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <Briefcase className="w-8 h-8 text-brand-navy mb-4 group-hover:text-brand-gold transition-colors" />
                                <h3 className="font-bold text-slate-800">Create New Case</h3>
                                <p className="text-sm text-gray-500 mt-1">Open a new file for a client.</p>
                            </div>
                        </Link>
                        <Link href="/admin/documents/upload">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <FileText className="w-8 h-8 text-brand-navy mb-4 group-hover:text-brand-gold transition-colors" />
                                <h3 className="font-bold text-slate-800">Upload Document</h3>
                                <p className="text-sm text-gray-500 mt-1">Add files to an existing case.</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
