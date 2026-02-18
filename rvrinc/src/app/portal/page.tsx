import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Briefcase, Calendar, Clock, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function PortalDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch active cases for this user
    const { data: cases } = await supabase
        .from("cases")
        .select("*")
        .eq("client_id", user.id)
        .eq("status", "open")
        .order("updated_at", { ascending: false })
        .limit(3);

    // Fetch recent documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*, cases(title)")
        .order("created_at", { ascending: false })
        .limit(3);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-brand-navy">Welcome back</h1>
                <p className="text-gray-500 mt-2">Here is an overview of your active legal matters.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-brand-gold shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
                        <Briefcase className="h-4 w-4 text-brand-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cases?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Next Appointment</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">No upcoming appointments</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Action Required</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Documents pending review</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Recent Cases */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-brand-navy">Recent Activity</h2>
                        <Link href="/portal/cases">
                            <Button variant="link" className="text-brand-gold">View All Cases</Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {cases && cases.length > 0 ? (
                            cases.map((c: any) => (
                                <div key={c.id} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-brand-navy">{c.title}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">{c.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{c.description}</p>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <Clock className="w-3 h-3 mr-1" /> Updated: {new Date(c.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center">
                                <p className="text-gray-500">No active cases found.</p>
                                <Link href="/contact" className="text-brand-gold hover:underline mt-2 inline-block text-sm">Contact us to start a new case</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Notifications / Documents */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-brand-navy">Recent Documents</h2>
                        <Link href="/portal/documents">
                            <Button variant="link" className="text-brand-gold">View Documents</Button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y">
                        {documents && documents.length > 0 ? (
                            documents.map((doc: any) => (
                                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded text-gray-500">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                                            <p className="text-xs text-gray-500">{doc.cases?.title}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-brand-navy">Download</Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No documents uploaded yet.
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
