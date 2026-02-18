import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Briefcase, Users, FileText, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
    const supabase = createClient();

    // Fetch stats (simplified for now, ideally use count(*))
    const { count: casesCount } = await supabase.from("cases").select("*", { count: 'exact', head: true });
    const { count: clientsCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq('role', 'client');
    const { count: documentsCount } = await supabase.from("documents").select("*", { count: 'exact', head: true });
    const { count: pendingAppointments } = await supabase.from("appointments").select("*", { count: 'exact', head: true }).eq('status', 'pending');

    // Fetch recent cases
    const { data: recentCases } = await supabase
        .from("cases")
        .select("*, client:profiles!client_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

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
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentCases?.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-slate-800">{c.title}</td>
                                        <td className="px-6 py-3 text-gray-600">{c.client?.full_name || 'Unknown'}</td>
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
                        <Link href="/admin/users/invite">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <Users className="w-8 h-8 text-brand-navy mb-4 group-hover:text-brand-gold transition-colors" />
                                <h3 className="font-bold text-slate-800">Invite Client</h3>
                                <p className="text-sm text-gray-500 mt-1">Send a registration invite.</p>
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
