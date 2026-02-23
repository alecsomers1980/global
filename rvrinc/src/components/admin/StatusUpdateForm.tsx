"use client";

import { useState, useTransition } from "react";
import { updateCaseStatus } from "@/app/admin/cases/actions";
import { RAF_STATUSES, PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";

interface StatusUpdateFormProps {
    caseId: string;
    currentStatus: string;
}

export default function StatusUpdateForm({ caseId, currentStatus }: StatusUpdateFormProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [notes, setNotes] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showSuccess, setShowSuccess] = useState(false);

    const selectedConfig = RAF_STATUSES.find(s => s.slug === selectedStatus);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("caseId", caseId);
        formData.set("status", selectedStatus);
        formData.set("notes", notes);
        formData.set("scheduledDate", scheduledDate);

        startTransition(async () => {
            await updateCaseStatus(formData);
            setNotes("");
            setScheduledDate("");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        });
    };

    // Group statuses by phase for the dropdown
    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-gold inline-block" />
                Update Case Status
            </h3>

            {/* Status Dropdown grouped by phase */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white"
                >
                    {phases.map(([phase, config]) => (
                        <optgroup key={phase} label={`${config.label}`}>
                            {RAF_STATUSES.filter(s => s.phase === phase).map(status => (
                                <option key={status.slug} value={status.slug}>
                                    {status.sortOrder}. {status.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            {/* Show default note hint */}
            {selectedConfig?.defaultNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <strong>Default Note:</strong> {selectedConfig.defaultNote}
                </div>
            )}

            {/* Client action required warning */}
            {selectedConfig?.requiresClientAction && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    ⚡ This status requires action from the client. They will be notified.
                </div>
            )}

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes {selectedConfig?.requiresNote && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={selectedConfig?.defaultNote || "Add notes about this status change..."}
                    rows={3}
                    required={selectedConfig?.requiresNote}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none"
                />
            </div>

            {/* Date picker for statuses that need a court date */}
            {selectedConfig?.requiresDate && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Court/Scheduled Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending || selectedStatus === currentStatus}
                className="w-full py-2.5 px-4 bg-brand-navy text-white rounded-lg font-medium text-sm hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Updating..." : "Update Status"}
            </button>

            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 text-center animate-pulse">
                    ✓ Status updated successfully!
                </div>
            )}
        </form>
    );
}
