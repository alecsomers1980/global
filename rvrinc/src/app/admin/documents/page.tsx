import { createClient } from "@/lib/supabase/server";
import { FileText, Search, Filter, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DownloadButton } from "@/components/portal/DownloadButton";

export default async function AdminDocumentsPage() {
    const supabase = createClient();

    // Fetch all documents with case and uploader details
    const { data: documents } = await supabase
        .from("documents")
        .select("*, cases(title, case_number), uploader:profiles!uploaded_by(full_name)")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Document Center</h1>
                    <p className="text-slate-500 mt-2">Review and manage all case files.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    <Link href="/admin/documents/upload">
                        <Button variant="brand"><FileText className="w-4 h-4 mr-2" /> Upload New</Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Related Case</th>
                                <th className="px-6 py-4">Uploaded By</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {documents?.map((doc: any) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-navy/5 p-2 rounded text-brand-navy">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-slate-800">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {doc.cases ? (
                                            <div className="flex flex-col">
                                                <span className="text-slate-800">{doc.cases.title}</span>
                                                <span className="text-xs text-slate-500">#{doc.cases.case_number}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">General</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {doc.uploader?.full_name || 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <DownloadButton filePath={doc.file_path} />
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {(!documents || documents.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No documents found.
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
