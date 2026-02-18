import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Briefcase, Calendar, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function MyCasesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: cases } = await supabase
        .from("cases")
        .select("*, attorney:profiles!attorney_id(full_name)")
        .or(`client_id.eq.${user.id},attorney_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-navy">My Cases</h1>
                    <p className="text-gray-500 mt-2">Track the progress of your legal matters.</p>
                </div>
                <Link href="/contact">
                    <Button variant="brand">Request New Case</Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {cases && cases.length > 0 ? (
                    cases.map((c: any) => (
                        <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-brand-navy">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-brand-navy">{c.title}</h2>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                            c.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                c.status === 'litigation' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 line-clamp-1">{c.description}</p>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> Case #{c.case_number}</span>
                                        {c.attorney && <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> Attorney: {c.attorney.full_name}</span>}
                                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Updated: {new Date(c.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-brand-navy">
                                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No cases found</h3>
                        <p className="text-gray-500 mb-6">You don&apos;t have any active cases yet.</p>
                        <Link href="/contact">
                            <Button variant="outline">Contact Us</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
