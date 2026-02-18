import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FileText, Download, Upload, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DocumentUpload } from "@/components/portal/DocumentUpload";
import { DownloadButton } from "@/components/portal/DownloadButton";

export default async function DocumentsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch documents linked to user's cases
    const { data: documents } = await supabase
        .from("documents")
        .select("*, cases(title, case_number)")
        .order("created_at", { ascending: false });

    // Fetch open cases for upload dropdown
    const { data: cases } = await supabase
        .from("cases")
        .select("id, title, case_number")
        .eq("client_id", user.id) // Assuming client role for now
        .eq("status", "open");

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-navy">Documents</h1>
                    <p className="text-gray-500 mt-2">Securely access and manage your legal documents.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    <DocumentUpload userId={user.id} cases={cases || []} />
                </div>
            </div>

            {/* Search Bar - Placeholder */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search documents by name or case..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Document Name</th>
                                <th className="px-6 py-4">Case Reference</th>
                                <th className="px-6 py-4">Date Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {documents && documents.length > 0 ? (
                                documents.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-brand-navy flex items-center gap-3">
                                            <div className="bg-brand-navy/5 p-2 rounded text-brand-navy">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            {doc.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {doc.cases ? (
                                                <div className="flex flex-col">
                                                    <span>{doc.cases.title}</span>
                                                    <span className="text-xs text-gray-400">#{doc.cases.case_number}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">General</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DownloadButton filePath={doc.file_path} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p>No documents found.</p>
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
