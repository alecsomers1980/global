import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, User, Calendar, Clock, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { getStatusLabel, getStatusColor, getClientMessage, getPhaseProgress, isClientActionRequired, PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";

export default async function PortalCaseDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: caseData } = await supabase
        .from("cases")
        .select("*, attorney:profiles!attorney_id(full_name)")
        .eq("id", params.id)
        .single();

    if (!caseData) return notFound();

    // Fetch related documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", params.id)
        .order("created_at", { ascending: false });

    // Fetch status history for timeline
    const { data: statusHistory } = await supabase
        .from("case_status_history")
        .select("*")
        .eq("case_id", params.id)
        .order("changed_at", { ascending: false });

    const { bgColor, textColor } = getStatusColor(caseData.status);
    const statusLabel = getStatusLabel(caseData.status);
    const clientMessage = getClientMessage(caseData.status);
    const progress = getPhaseProgress(caseData.status);
    const clientActionNeeded = isClientActionRequired(caseData.status);
    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];

    return (
        <div className="space-y-8 max-w-4xl">
            <Link href="/portal/cases">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-brand-gold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Cases
                </Button>
            </Link>

            {/* Case Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-start gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-serif font-bold text-brand-navy">{caseData.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${bgColor} ${textColor}`}>
                        {statusLabel}
                    </span>
                </div>
                <p className="text-gray-500">Case #{caseData.case_number}</p>

                {caseData.description && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-700">{caseData.description}</p>
                    </div>
                )}

                {/* Progress Stepper */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Case Progress</span>
                        <span className="text-sm font-bold text-brand-navy">Phase {progress.current} of {progress.total}</span>
                    </div>
                    <div className="flex gap-2">
                        {phases.map(([phase, config], i) => (
                            <div key={phase} className="flex-1 text-center">
                                <div
                                    className={`h-3 rounded-full mb-2 transition-all ${i < progress.current ? '' : 'bg-gray-200'}`}
                                    style={{ backgroundColor: i < progress.current ? config.color : undefined }}
                                />
                                <span className={`text-xs ${i < progress.current ? 'font-bold text-gray-700' : 'text-gray-400'}`}>
                                    {config.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-brand-gold mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Attorney</p>
                            <p className="font-semibold text-slate-800">{caseData.attorney?.full_name || "Unassigned"}</p>
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

            {/* Client Action Required Card */}
            {clientActionNeeded && (
                <div className="bg-gradient-to-r from-brand-navy to-brand-navy/90 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-bold mb-2">Action Required From You</h3>
                            <p className="text-white/90 leading-relaxed">{clientMessage}</p>
                            {caseData.status_notes && (
                                <p className="mt-3 text-sm text-brand-gold/90 bg-white/10 rounded-lg p-3">
                                    <strong>Note from your attorney:</strong> {caseData.status_notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Message Card (when no client action needed) */}
            {!clientActionNeeded && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Current Status Update</h3>
                            <p className="text-gray-700 leading-relaxed">{clientMessage}</p>
                            {caseData.status_notes && (
                                <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                    <strong>Attorney notes:</strong> {caseData.status_notes}
                                </p>
                            )}
                            {caseData.scheduled_date && (
                                <p className="mt-3 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                                    📅 <strong>Scheduled Date:</strong> {new Date(caseData.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-serif font-bold text-brand-navy mb-6">Case History</h2>

                {statusHistory && statusHistory.length > 0 ? (
                    <div className="space-y-4">
                        {statusHistory.map((entry: any, index: number) => {
                            const entryColor = getStatusColor(entry.new_status);
                            return (
                                <div key={entry.id} className={`flex items-start gap-3 ${index !== statusHistory.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}>
                                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0`} style={{ backgroundColor: PHASE_CONFIG[getStatusColor(entry.new_status).bgColor.includes('blue') ? 'intake' : 'claim']?.color || '#6B7280' }} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${entryColor.bgColor} ${entryColor.textColor}`}>
                                                {getStatusLabel(entry.new_status)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(entry.changed_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {entry.notes && (
                                            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No timeline entries yet.</p>
                )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-serif font-bold text-brand-navy mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-gold" /> Documents
                </h2>
                {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-brand-navy" />
                                    <div>
                                        <p className="font-medium text-brand-navy">{doc.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No documents attached to this case yet.</p>
                )}
            </div>
        </div>
    );
}
