import { createClient } from "@/lib/supabase/server";
import { DocumentUpload } from "@/components/portal/DocumentUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminDocumentUploadPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch ALL open cases for admin to upload to
    const { data: cases } = await supabase
        .from("cases")
        .select("id, title, case_number")
        .eq("status", "open")
        .order("title");

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link href="/admin/documents">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-brand-gold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Documents
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Upload to Case</h1>
                <p className="text-slate-500 mt-2">Add a document to a specific client case file.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <DocumentUpload
                    userId={user.id}
                    cases={cases || []}
                />
            </div>
        </div>
    );
}
