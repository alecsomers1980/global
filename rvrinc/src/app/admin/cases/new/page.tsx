import { createClient } from "@/lib/supabase/server";
import { NewCaseForm } from "@/components/admin/NewCaseForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function NewCasePage() {
    const supabase = createClient();

    // Fetch clients for dropdown
    const { data: clients } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "client")
        .order("full_name");

    // Fetch attorneys for dropdown
    const { data: attorneys } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "attorney")
        .order("full_name");

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link href="/admin/cases">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-brand-gold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cases
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Open New Case</h1>
                <p className="text-slate-500 mt-2">Initialize a new legal matter for a client.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <NewCaseForm
                    clients={clients || []}
                    attorneys={attorneys || []}
                />
            </div>
        </div>
    );
}
