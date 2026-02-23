import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UploadCard from "./UploadCard";

export const metadata = { title: "Dashboard | Client Portal" };

const REQUIRED_DOCS = [
    { type: 'id_copy', label: 'South African ID (Front & Back)' },
    { type: 'proof_of_address', label: 'Proof of Address (Utility Bill)' },
    { type: 'payslip_1', label: 'Most Recent Payslip' },
    { type: 'payslip_2', label: 'Payslip 2 (Last Month)' },
    { type: 'payslip_3', label: 'Payslip 3 (2 Months Ago)' },
    { type: 'bank_statement_3_months', label: '3 Months Bank Statements (PDF)' },
    { type: 'drivers_license', label: 'Valid Drivers License' }
];

export default async function PortalDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    const { data: lead } = await supabase
        .from('leads')
        .select(`
            *,
            cars(make, model, year, main_image_url, price),
            profiles:affiliate_id(first_name, last_name, phone)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!lead) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mt-12 mb-20">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">folder_off</span>
                <h2 className="text-2xl font-bold text-slate-800">No Active Deal Found</h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                    Your dedicated sales executive has not yet linked a vehicle to your profile. Please check back later or contact the dealership.
                </p>
            </div>
        );
    }

    const { data: docs } = await supabase
        .from('lead_documents')
        .select('*')
        .eq('client_id', user.id)
        .eq('lead_id', lead.id);

    // Helper map to quickly find document status (pending, uploaded, approved, rejected)
    const docStatusMap = {};
    docs?.forEach(d => { docStatusMap[d.document_type] = d.status; });

    const totalRequired = REQUIRED_DOCS.length;
    const totalUploaded = REQUIRED_DOCS.filter(d => ['uploaded', 'approved'].includes(docStatusMap[d.type])).length;
    const progressPercent = Math.round((totalUploaded / totalRequired) * 100);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Car Intro */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 flex flex-col md:flex-row">
                {lead.cars?.main_image_url ? (
                    <img src={lead.cars.main_image_url} className="w-full md:w-1/3 h-56 md:h-auto object-cover" alt="Car" />
                ) : (
                    <div className="w-full md:w-1/3 h-56 flex items-center justify-center bg-slate-100 text-slate-300 border-r border-slate-100">
                        <span className="material-symbols-outlined text-5xl">directions_car</span>
                    </div>
                )}

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">local_mall</span>
                                Your Vehicle Deal
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{lead.cars?.year} {lead.cars?.make} {lead.cars?.model}</h1>

                            {/* Assigned Affiliate / Status */}
                            <div className="mt-4 flex flex-wrap gap-3">
                                {lead.profiles ? (
                                    <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-sm font-medium">
                                        <span className="material-symbols-outlined text-[16px]">support_agent</span>
                                        Agent: {lead.profiles.first_name} {lead.profiles.last_name}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded text-sm font-medium">
                                        <span className="material-symbols-outlined text-[16px]">support_agent</span>
                                        Everest Internal Team
                                    </div>
                                )}

                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wider ${lead.status === 'new' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    lead.status === 'contacted' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        lead.status === 'finance_pending' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                            lead.status === 'closed_won' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}>
                                    Status: {lead.status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded shadow-sm self-start whitespace-nowrap">
                            R {new Intl.NumberFormat('en-ZA').format(lead.cars?.price || 0)}
                        </span>
                    </div>

                    <div className="mt-auto">
                        <div className="flex justify-between text-sm font-bold mb-3">
                            <span className="text-slate-700 uppercase tracking-wider text-xs">Finance Application Progress</span>
                            <span className="text-primary">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                            <div className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="text-slate-500 mt-4 text-sm bg-slate-50 p-3 rounded border border-slate-100">
                            {progressPercent === 100
                                ? "🎉 All documents received. We are processing your finance application with the banks. We will be in touch shortly!"
                                : `Please upload the ${totalRequired - totalUploaded} remaining documents below to proceed with your application.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6 mt-12">
                <span className="material-symbols-outlined text-slate-400">lock</span>
                <h2 className="text-xl font-bold text-slate-900">Required Finance Documents</h2>
            </div>

            <div className="space-y-4 mb-20">
                {REQUIRED_DOCS.map(doc => (
                    <UploadCard
                        key={doc.type}
                        leadId={lead.id}
                        documentType={doc.type}
                        label={doc.label}
                        status={docStatusMap[doc.type] || 'pending'}
                    />
                ))}
            </div>
        </div>
    );
}
