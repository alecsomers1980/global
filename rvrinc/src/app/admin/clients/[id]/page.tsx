import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, User, Mail, Calendar, Briefcase, FileText } from "lucide-react";

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    // Fetch client profile
    const { data: client } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

    if (!client) return notFound();

    // Fetch client's cases
    const { data: cases } = await supabase
        .from("cases")
        .select("*, attorney:profiles!attorney_id(full_name)")
        .eq("client_id", params.id)
        .order("updated_at", { ascending: false });

    // Fetch client's documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*, cases(title, case_number)")
        .in("case_id", cases?.map((c: any) => c.id) || [])
        .order("created_at", { ascending: false });

    const statusColor: Record<string, string> = {
        open: "bg-blue-100 text-blue-800",
        closed: "bg-gray-100 text-gray-800",
        litigation: "bg-red-100 text-red-800",
        pending: "bg-yellow-100 text-yellow-800",
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <Link href="/admin/clients">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-brand-gold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
                </Button>
            </Link>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                        {client.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900">{client.full_name || "Unknown Client"}</h1>
                        <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-gray-600">
                            {client.email && (
                                <span className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-brand-gold" />
                                    <a href={`mailto:${client.email}`} className="text-brand-gold hover:underline">{client.email}</a>
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Joined {new Date(client.created_at).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                                {client.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cases */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-gold" /> Cases ({cases?.length || 0})
                </h2>
                {cases && cases.length > 0 ? (
                    <div className="space-y-3">
                        {cases.map((c: any) => (
                            <Link key={c.id} href={`/admin/cases/${c.id}`}>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div>
                                        <p className="font-semibold text-slate-800">{c.title}</p>
                                        <p className="text-xs text-gray-500">#{c.case_number} &bull; Attorney: {c.attorney?.full_name || "Unassigned"}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColor[c.status] || statusColor.pending}`}>
                                        {c.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-6">No cases for this client.</p>
                )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-gold" /> Documents ({documents?.length || 0})
                </h2>
                {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-brand-navy" />
                                    <div>
                                        <p className="font-medium text-slate-800">{doc.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {doc.cases?.title || "General"} &bull; {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-6">No documents for this client.</p>
                )}
            </div>
        </div>
    );
}
