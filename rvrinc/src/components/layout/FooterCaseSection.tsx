"use client";

import { useState } from "react";
import { CaseStatusModal } from "@/components/CaseStatusModal";

export function FooterCaseSection() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">View Case Status</h4>
            <p className="text-sm text-gray-300">Existing clients can track the progress of their case.</p>
            <button
                onClick={() => setModalOpen(true)}
                className="inline-block px-4 py-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-colors rounded-md text-sm"
            >
                Check Your Case
            </button>
            <CaseStatusModal open={modalOpen} onOpenChange={setModalOpen} />
        </div>
    );
}
