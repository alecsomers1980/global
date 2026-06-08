import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Briefcase, User, Calendar, Clock, FileText, History, AlertTriangle } from "lucide-react";
import { getStatusLabel, getStatusColor, getPhaseProgress, PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";
import { getBranchLabel } from "@/lib/branch";
import { getPrescriptionInfo } from "@/lib/prescription";
import StatusUpdateForm from "@/components/admin/StatusUpdateForm";
import { getCaseStatuses } from "@/lib/statuses";
import AssignAttorneyForm from "@/components/admin/AssignAttorneyForm";
import SharePointFiles from "@/components/admin/SharePointFiles";
import { listCaseFiles } from "@/lib/sharepoint";

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    const { data: caseData } = await supabase
        .from("cases")
        .select("*")
        .eq("id", params.id)
        .single();

    if (!caseData) return notFound();

    // Fetch all attorneys for the reassignment dropdown
    const { data: allAttorneys } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("role", ["attorney", "admin", "staff"])
        .order("full_name");

    // Fetch related documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", params.id)
        .order("created_at", { ascending: false });

    // Fetch status history
    const { data: rawHistory } = await supabase
        .from("case_status_history")
        .select("*")
        .eq("case_id", params.id)
        .order("changed_at", { ascending: false });

    // Resolve changed_by names in memory (avoid PostgREST embed)
    const changerIds = (rawHistory || [])
        .map((h: any) => h.changed_by)
        .filter((v: any, i: number, a: any[]) => v && a.indexOf(v) === i);
    const changerMap = new Map<string, string>();
    if (changerIds.length > 0) {
        const { data: changers } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", changerIds);
        changers?.forEach((p: any) => changerMap.set(p.id, p.full_name));
    }
    const statusHistory = rawHistory?.map((h: any) => ({
        ...h,
        changed_by_profile: { full_name: changerMap.get(h.changed_by) || null },
    })) || [];

    const statuses = await getCaseStatuses();
    const { bgColor, textColor } = getStatusColor(caseData.status, statuses);
    const statusLabel = getStatusLabel(caseData.status, statuses);
    const progress = getPhaseProgress(caseData.status, statuses);
    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];
    const prescription = getPrescriptionInfo(caseData.accident_date, caseData.status);

    // Fetch SharePoint files for this case
    const sharePointData = await listCaseFiles(caseData.case_number);

    return (
        <div className="space-y-8 max-w-6xl">
            <Link href="/admin/cases">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-brand-gold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cases
                </Button>
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-slate-900">{caseData.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${bgColor} ${textColor}`}>
                                {statusLabel}
                            </span>
                        </div>
                        <p className="text-gray-500">
                            {caseData.case_number}
                            {caseData.accident_date && (
                                <span className="ml-4 text-gray-400">
                                    Accident: {new Date(caseData.accident_date).toLocaleDateString('en-ZA')}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Case Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Branch</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            caseData.branch === 'marble-hall' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                            {getBranchLabel(caseData.branch || 'pretoria')}
                        </span>
                    </div>
                    {caseData.id_number && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">ID / Passport</p>
                            <p className="font-mono text-sm font-semibold text-slate-800">{caseData.id_number}</p>
                        </div>
                    )}
                    {caseData.raf_ref && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">RAF Ref</p>
                            <p className="font-mono text-sm font-semibold text-slate-800">{caseData.raf_ref}</p>
                        </div>
                    )}
                    {caseData.place_of_accident && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Place of Accident</p>
                            <p className="text-sm text-slate-800">{caseData.place_of_accident}</p>
                        </div>
                    )}
                    {caseData.date_of_lodgement && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Lodgement</p>
                            <p className="text-sm text-slate-800">{caseData.date_of_lodgement}</p>
                        </div>
                    )}
                    {caseData.date_of_summons && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Summons</p>
                            <p className="text-sm text-slate-800">{caseData.date_of_summons}</p>
                        </div>
                    )}
                    {caseData.date_of_relodgement && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Re-Lodgement</p>
                            <p className="text-sm text-slate-800">{caseData.date_of_relodgement}</p>
                        </div>
                    )}
                </div>

                {caseData.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-gray-700 text-sm">{caseData.description}</p>
                    </div>
                )}

                {/* Phase Progress Bar */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Case Progress</span>
                        <span className="text-xs font-bold text-brand-navy">{progress.percentage}%</span>
                    </div>
                    <div className="flex gap-1">
                        {phases.map(([phase, config], i) => (
                            <div
                                key={phase}
                                className={`h-2 flex-1 rounded-full transition-colors ${i < progress.current ? config.bgColor.replace('100', '500').replace('bg-', 'bg-') : 'bg-gray-200'}`}
                                style={{ backgroundColor: i < progress.current ? config.color : undefined }}
                                title={config.label}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1">
                        {phases.map(([phase, config], i) => (
                            <span key={phase} className={`text-[10px] ${i < progress.current ? 'font-bold text-gray-700' : 'text-gray-400'}`}>
                                {config.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Status Notes */}
                {caseData.status_notes && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800"><strong>Status Notes:</strong> {caseData.status_notes}</p>
                    </div>
                )}

                {/* Prescription Deadline Alert */}
                {prescription && (
                    <div className={`mt-4 p-5 ${prescription.bgColor} border ${prescription.borderColor} rounded-lg`}>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${
                                prescription.risk === "expired" || prescription.risk === "critical"
                                    ? "text-red-500"
                                    : prescription.risk === "warning"
                                    ? "text-orange-500"
                                    : "text-yellow-500"
                            }`} />
                            <div>
                                <p className={`font-bold text-sm ${prescription.textColor}`}>{prescription.label}</p>
                                <p className={`text-sm mt-1 ${prescription.textColor} opacity-90`}>{prescription.message}</p>
                                <p className="text-xs mt-2 opacity-70">
                                    Accident: {new Date(prescription.accidentDate).toLocaleDateString('en-ZA')} &bull;
                                    Deadline: {prescription.deadlineDate.toLocaleDateString('en-ZA')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diary Date Warning */}
                {caseData.diary_date && new Date(caseData.diary_date) < new Date() && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-800">
                            <strong>Diary date has passed!</strong> Follow-up was due {new Date(caseData.diary_date).toLocaleDateString()}. Action required.
                        </p>
                    </div>
                )}

                {/* Scheduled Court Date */}
                {caseData.scheduled_date && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            <strong>Scheduled Court Date:</strong> {new Date(caseData.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                )}

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-brand-gold mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Attorney</p>
                            <AssignAttorneyForm
                                caseId={caseData.id}
                                currentAttorneyId={caseData.attorney_id}
                                attorneys={allAttorneys || []}
                            />
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-brand-gold mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Created</p>
                            <p className="font-semibold text-slate-800">{new Date(caseData.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-brand-gold mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Last Updated</p>
                            <p className="font-semibold text-slate-800">{new Date(caseData.updated_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column: Status Update + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Update Form */}
                <div className="lg:col-span-1">
                    <StatusUpdateForm caseId={caseData.id} currentStatus={caseData.status} statuses={statuses} />
                </div>

                {/* Status Timeline */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <History className="w-5 h-5 text-brand-gold" /> Status Timeline
                    </h3>

                    {statusHistory && statusHistory.length > 0 ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                            <div className="space-y-6">
                                {statusHistory.map((entry: any, index: number) => {
                                    const entryColor = getStatusColor(entry.new_status, statuses);
                                    return (
                                        <div key={entry.id} className="relative flex gap-4 pl-2">
                                            {/* Dot */}
                                            <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0 z-10 ${index === 0 ? 'bg-brand-gold' : 'bg-gray-300'}`} />

                                            <div className="flex-1 pb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${entryColor.bgColor} ${entryColor.textColor}`}>
                                                        {getStatusLabel(entry.new_status, statuses)}
                                                    </span>
                                                    {entry.old_status && (
                                                        <span className="text-xs text-gray-400">
                                                            from {getStatusLabel(entry.old_status, statuses)}
                                                        </span>
                                                    )}
                                                </div>
                                                {entry.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                                                )}
                                                {entry.scheduled_date && (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        📅 Scheduled: {new Date(entry.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {entry.changed_by_profile?.full_name || 'System'} • {new Date(entry.changed_at).toLocaleString('en-ZA')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">No status changes recorded yet.</p>
                    )}
                </div>
            </div>

            {/* SharePoint Case Files */}
            <SharePointFiles
                files={sharePointData.files}
                folderUrl={sharePointData.folderUrl}
                error={sharePointData.error}
            />

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-gold" /> Case Documents
                </h2>
                {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-brand-navy" />
                                    <div>
                                        <p className="font-medium text-slate-800">{doc.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No documents attached to this case.</p>
                )}
            </div>
        </div>
    );
}
