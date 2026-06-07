// Central RAF Status Configuration for RVR Inc
// All 67 statuses organized by phase with metadata

export type StatusPhase =
    | 'intake'
    | 'claim'
    | 'litigation'
    | 'prep_court'
    | 'court'
    | 'general_damages'
    | 'payment'
    | 'costs'
    | 'undertaking'
    | 'finalization';

export interface StatusConfig {
    slug: string;
    label: string;
    phase: StatusPhase;
    sortOrder: number;
    defaultNote?: string;
    requiresNote: boolean;
    requiresDate: boolean;
    requiresClientAction: boolean;
    clientMessage: string;
}

export const PHASE_CONFIG: Record<StatusPhase, { label: string; color: string; bgColor: string; textColor: string; icon: string }> = {
    intake: { label: 'Intake', color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: 'clipboard-list' },
    claim: { label: 'Claim Lodged', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800', icon: 'file-text' },
    litigation: { label: 'Litigation', color: '#F97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800', icon: 'scale' },
    prep_court: { label: 'Prep for Court', color: '#06B6D4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', icon: 'folder-open' },
    court: { label: 'Court', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: 'gavel' },
    general_damages: { label: 'General Damages', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: 'shield' },
    payment: { label: 'Payment', color: '#10B981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', icon: 'banknote' },
    costs: { label: 'Costs', color: '#14B8A6', bgColor: 'bg-teal-100', textColor: 'text-teal-800', icon: 'calculator' },
    undertaking: { label: 'Undertaking', color: '#6366F1', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', icon: 'file-check' },
    finalization: { label: 'Finalised', color: '#22C55E', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: 'check-circle' },
};

export const RAF_STATUSES: StatusConfig[] = [
    // INTAKE
    { slug: 'consultation_complete', label: 'Consultation complete', phase: 'intake', sortOrder: 1, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Consultation complete' },
    { slug: 'consultation_letter_sent', label: 'Confirmation of consultation letter sent to client', phase: 'intake', sortOrder: 2, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Confirmation of consultation letter sent to client' },
    { slug: 'requested_records', label: 'Requested Hospital records & Accident report', phase: 'intake', sortOrder: 3, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Requested Hospital records & Accident report' },
    { slug: 'client_obtain_records', label: 'Client to assist in obtaining hospital records', phase: 'intake', sortOrder: 4, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to assist in obtaining hospital records' },
    { slug: 'client_obtain_accident_report', label: 'Client to assist in obtaining accident report', phase: 'intake', sortOrder: 5, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to assist in obtaining accident report' },
    { slug: 'client_obtain_records_and_report', label: 'Client to assist in obtaining hospital records & accident report', phase: 'intake', sortOrder: 6, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to assist in obtaining hospital records & accident report' },
    { slug: 'client_sign_affidavit', label: 'Client to sign affidavit & send certified copy of ID', phase: 'intake', sortOrder: 7, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to sign affidavit & send certified copy of ID' },

    // CLAIM LODGED
    { slug: 'claim_lodged', label: 'Claim lodged date', phase: 'claim', sortOrder: 8, requiresNote: false, requiresDate: true, requiresClientAction: false, clientMessage: 'Claim lodged date' },
    { slug: 'raf_objection_expired', label: 'Time expired for RAF to object, Summons to be drafted', phase: 'claim', sortOrder: 9, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Time expired for RAF to object, Summons to be drafted' },

    // LITIGATION
    { slug: 'drafting_summons', label: 'Drafting Summons', phase: 'litigation', sortOrder: 10, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Drafting Summons' },
    { slug: 'advocate_review_summons', label: 'Advocate review Summons', phase: 'litigation', sortOrder: 11, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Advocate review Summons' },
    { slug: 'summons_issued_served', label: 'Summons issued and served', phase: 'litigation', sortOrder: 12, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Summons issued and served' },
    { slug: 'matter_defended', label: 'Matter defended', phase: 'litigation', sortOrder: 13, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Matter defended' },
    { slug: 'mediation', label: 'Mediation', phase: 'litigation', sortOrder: 14, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Mediation' },
    { slug: 'application_compel_mediate', label: 'Application to compel to mediate', phase: 'litigation', sortOrder: 15, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Application to compel to mediate' },
    { slug: 'application_delinquent_mediator', label: 'Application for delinquent mediator', phase: 'litigation', sortOrder: 16, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Application for delinquent mediator' },
    { slug: 'apply_default_judgment_roll', label: 'Apply for date on default judgment roll after mediation was unsuccessful', phase: 'litigation', sortOrder: 17, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Apply for date on default judgment roll after mediation was unsuccessful' },
    { slug: 'notice_of_bar', label: 'Notice of bar', phase: 'litigation', sortOrder: 18, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Notice of bar' },
    { slug: 'plea', label: 'Plea', phase: 'litigation', sortOrder: 19, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Plea' },
    { slug: 'proceeding_default', label: 'Proceeding on default basis', phase: 'litigation', sortOrder: 20, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Proceeding on default basis' },
    { slug: 'applied_court_date', label: 'Applied for date from court', phase: 'litigation', sortOrder: 21, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Applied for date from court' },
    { slug: 'followed_up_court_date', label: 'Followed up on court date', phase: 'litigation', sortOrder: 22, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Followed up on court date' },
    { slug: 'default_judgment_merits', label: 'Obtain default judgment date – merits only', phase: 'litigation', sortOrder: 23, requiresNote: false, requiresDate: true, requiresClientAction: false, clientMessage: 'Obtain default judgment date – merits only' },
    { slug: 'default_judgment_quantum', label: 'Obtain default judgment date – quantum only', phase: 'litigation', sortOrder: 24, requiresNote: false, requiresDate: true, requiresClientAction: false, clientMessage: 'Obtain default judgment date – quantum only' },
    { slug: 'default_judgment_merits_quantum', label: 'Obtain default judgment date – merits & quantum', phase: 'litigation', sortOrder: 25, requiresNote: false, requiresDate: true, requiresClientAction: false, clientMessage: 'Obtain default judgment date – merits & quantum' },

    // PREPARATION FOR COURT
    { slug: 'client_provide_documents', label: 'Client to provide multiple documents in order to prove claim', phase: 'prep_court', sortOrder: 26, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to provide multiple documents in order to prove claim' },
    { slug: 'client_sign_discovery', label: 'Client to sign Discovery Affidavit', phase: 'prep_court', sortOrder: 27, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to sign Discovery Affidavit' },
    { slug: 'client_attend_medico_legal', label: 'Client to attend to medico-legal appointments', phase: 'prep_court', sortOrder: 28, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to attend to medico-legal appointments' },
    { slug: 'client_attend_inspection', label: 'Client to attend to inspection in loco', phase: 'prep_court', sortOrder: 29, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to attend to inspection in loco' },
    { slug: 'waiting_medico_legal_reports', label: 'Waiting for medico-legal reports from the experts', phase: 'prep_court', sortOrder: 30, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Waiting for medico-legal reports from the experts' },
    { slug: 'client_sign_damages', label: 'Client to sign damages affidavit', phase: 'prep_court', sortOrder: 31, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Client to sign damages affidavit' },

    // COURT
    { slug: 'matter_heard', label: 'Matter heard', phase: 'court', sortOrder: 32, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Matter heard' },
    { slug: 'obtained_outcome', label: 'Obtained outcome', phase: 'court', sortOrder: 33, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Obtained outcome' },
    { slug: 'follow_up_court_order', label: 'Follow up on court order', phase: 'court', sortOrder: 34, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Follow up on court order' },
    { slug: 'court_order_sent_raf', label: 'Court order sent to RAF for payment', phase: 'court', sortOrder: 35, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Court order sent to RAF for payment' },
    { slug: 'court_ordered_trust', label: 'Court ordered for a Trust to be established – all monies will go to the Trust', phase: 'court', sortOrder: 36, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Court ordered for a Trust to be established – all monies will go to the Trust' },

    // GENERAL DAMAGES
    { slug: 'raf_undecided_general', label: 'RAF undecided on General damages', phase: 'general_damages', sortOrder: 37, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'RAF undecided on General damages' },
    { slug: 'apply_compel_raf_general', label: 'Apply for date to compel RAF to make a decision on the General Damages', phase: 'general_damages', sortOrder: 38, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Apply for date to compel RAF to make a decision on the General Damages' },
    { slug: 'raf_accepted_general', label: 'RAF accepted General damages', phase: 'general_damages', sortOrder: 39, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'RAF accepted General damages' },
    { slug: 'apply_new_court_date', label: 'Apply to Court for a new court date', phase: 'general_damages', sortOrder: 40, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Apply to Court for a new court date' },
    { slug: 'settled_general_damages', label: 'Settled general damages with RAF', phase: 'general_damages', sortOrder: 41, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Settled general damages with RAF' },
    { slug: 'follow_up_court_date_general', label: 'Follow up on date for court', phase: 'general_damages', sortOrder: 42, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Follow up on date for court' },
    { slug: 'raf_rejected_general', label: 'RAF rejected General damages', phase: 'general_damages', sortOrder: 43, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'RAF rejected General damages' },
    { slug: 'referred_hpcsa', label: 'Referred matter to HPCSA for a decision on the General damages', phase: 'general_damages', sortOrder: 44, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Referred matter to HPCSA for a decision on the General damages' },
    { slug: 'followed_up_hpcsa', label: 'Followed up from HPCSA regarding outcome', phase: 'general_damages', sortOrder: 45, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Followed up from HPCSA regarding outcome' },
    { slug: 'no_response_hpcsa', label: 'No response from HPCSA, we have to bring an application to compel them', phase: 'general_damages', sortOrder: 46, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'No response from HPCSA, we have to bring an application to compel them' },
    { slug: 'received_hpcsa_outcome', label: 'Received outcome from HPCSA', phase: 'general_damages', sortOrder: 47, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received outcome from HPCSA' },
    { slug: 'not_qualify_general', label: 'You do not qualify for General Damages', phase: 'general_damages', sortOrder: 48, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'You do not qualify for General Damages' },
    { slug: 'qualify_general', label: 'You qualify for General Damages, so we have to apply for a new date to go to court', phase: 'general_damages', sortOrder: 49, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'You qualify for General Damages, so we have to apply for a new date to go to court' },
    { slug: 'followed_up_new_date_general', label: 'Followed up new date from court for general damages', phase: 'general_damages', sortOrder: 50, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Followed up new date from court for general damages' },

    // PAYMENT
    { slug: 'received_payment_general', label: 'Received payment of General Damages from RAF', phase: 'payment', sortOrder: 51, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received payment of General Damages from RAF' },
    { slug: 'received_payment_loss_earnings', label: 'Received payment of Loss of Earnings from RAF', phase: 'payment', sortOrder: 52, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received payment of Loss of Earnings from RAF' },
    { slug: 'received_payment_medical', label: 'Received payment of past medical expenses from RAF – you will receive your part after we deducted our fee; the rest goes to the medical aid', phase: 'payment', sortOrder: 53, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received payment of past medical expenses from RAF – you will receive your part after we deducted our fee; the rest goes to the medical aid' },
    { slug: 'send_interest_letter', label: 'Send letter for interest on capital to RAF', phase: 'payment', sortOrder: 54, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Send letter for interest on capital to RAF' },
    { slug: 'request_bank_letter', label: 'Request bank letter from client to be sent to belinda@rvrinc.co.za', phase: 'payment', sortOrder: 55, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Request bank letter from client to be sent to belinda@rvrinc.co.za' },
    { slug: 'made_payment_client', label: 'Made payment to client', phase: 'payment', sortOrder: 56, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Made payment to client' },
    { slug: 'deducted_fees', label: 'Deducted experts and counsel fees from capital', phase: 'payment', sortOrder: 57, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Deducted experts and counsel fees from capital' },
    { slug: 'received_interest', label: 'Received interest from RAF, pay over to you after deducting our fees', phase: 'payment', sortOrder: 58, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received interest from RAF, pay over to you after deducting our fees' },

    // COSTS
    { slug: 'compiled_file_cost_consultant', label: 'Compiled file for cost consultant', phase: 'costs', sortOrder: 59, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Compiled file for cost consultant' },
    { slug: 'file_at_cost_consultant', label: 'File at cost consultant', phase: 'costs', sortOrder: 60, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'File at cost consultant' },
    { slug: 'obtain_taxation_date', label: 'Obtain taxation date', phase: 'costs', sortOrder: 61, requiresNote: false, requiresDate: true, requiresClientAction: false, clientMessage: 'Obtain taxation date' },
    { slug: 'received_costs_refund', label: 'Received money from RAF for costs – refund client for expert and counsel fees', phase: 'costs', sortOrder: 62, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received money from RAF for costs – refund client for expert and counsel fees' },
    { slug: 'follow_up_interest_payment', label: 'Follow up payment of interest on capital from RAF', phase: 'costs', sortOrder: 63, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Follow up payment of interest on capital from RAF' },

    // UNDERTAKING
    { slug: 'received_undertaking', label: 'Received Undertaking from RAF', phase: 'undertaking', sortOrder: 64, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Received Undertaking from RAF' },
    { slug: 'sent_undertaking_request', label: 'Sent request to RAF for Undertaking', phase: 'undertaking', sortOrder: 65, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Sent request to RAF for Undertaking' },
    { slug: 'followed_up_undertaking', label: 'Followed up at RAF for Undertaking', phase: 'undertaking', sortOrder: 66, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Followed up at RAF for Undertaking' },

    // FINALIZATION
    { slug: 'matter_finalized', label: 'All aspects of the matter have been finalized. Matter finalized. Close file', phase: 'finalization', sortOrder: 67, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'All aspects of the matter have been finalized. Matter finalized. Close file' },
];

// Helper functions

export function getStatusConfig(slug: string): StatusConfig | undefined {
    return RAF_STATUSES.find(s => s.slug === slug);
}

export function getStatusLabel(slug: string): string {
    return getStatusConfig(slug)?.label || slug;
}

export function getStatusPhase(slug: string): StatusPhase | undefined {
    return getStatusConfig(slug)?.phase;
}

export function getPhaseConfig(phase: StatusPhase) {
    return PHASE_CONFIG[phase];
}

export function getStatusColor(slug: string): { bgColor: string; textColor: string } {
    const phase = getStatusPhase(slug);
    if (!phase) return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    return { bgColor: PHASE_CONFIG[phase].bgColor, textColor: PHASE_CONFIG[phase].textColor };
}

export function getClientMessage(slug: string): string {
    return getStatusConfig(slug)?.clientMessage || 'Your case is being processed. We will update you shortly.';
}

const PHASE_ORDER: StatusPhase[] = ['intake', 'claim', 'litigation', 'prep_court', 'court', 'general_damages', 'payment', 'costs', 'undertaking', 'finalization'];

export function getPhaseProgress(slug: string): { current: number; total: number; percentage: number } {
    const total = PHASE_ORDER.length;
    const config = getStatusConfig(slug);
    if (!config) return { current: 0, total, percentage: 0 };

    const phaseIndex = PHASE_ORDER.indexOf(config.phase);
    return {
        current: phaseIndex + 1,
        total,
        percentage: Math.round(((phaseIndex + 1) / total) * 100),
    };
}

export function getStatusesByPhase(phase: StatusPhase): StatusConfig[] {
    return RAF_STATUSES.filter(s => s.phase === phase).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isClientActionRequired(slug: string): boolean {
    return getStatusConfig(slug)?.requiresClientAction || false;
}
