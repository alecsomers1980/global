// Central RAF Status Configuration for RVR Inc
// All 34 statuses organized by phase with metadata

export type StatusPhase = 'intake' | 'claim' | 'litigation' | 'court' | 'raf_damages' | 'settlement';

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
    court: { label: 'Court', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: 'gavel' },
    raf_damages: { label: 'RAF/Damages', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: 'shield' },
    settlement: { label: 'Settlement', color: '#10B981', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: 'check-circle' },
};

export const RAF_STATUSES: StatusConfig[] = [
    // INTAKE
    { slug: 'consultation_complete', label: 'Consultation Complete', phase: 'intake', sortOrder: 1, requiresNote: true, requiresDate: false, requiresClientAction: false, clientMessage: 'Your initial consultation has been completed. Our team is reviewing your case.' },
    { slug: 'requested_records', label: 'Requested Hospital Records & Accident Report', phase: 'intake', sortOrder: 2, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We have submitted requests for your hospital records and accident report.' },
    { slug: 'client_obtain_records', label: 'Client to Obtain Hospital Records', phase: 'intake', sortOrder: 3, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'We need your help to obtain your hospital records. Please collect them and submit to our office.' },
    { slug: 'client_obtain_accident_report', label: 'Client to Obtain Accident Report', phase: 'intake', sortOrder: 4, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'We need your help to obtain the accident report. Please collect it and submit to our office.' },
    { slug: 'client_obtain_records_and_report', label: 'Client to Obtain Records & Accident Report', phase: 'intake', sortOrder: 5, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'We need your help to obtain both your hospital records and the accident report.' },
    { slug: 'client_sign_affidavit', label: 'Client to Sign Affidavit & Send Certified ID', phase: 'intake', sortOrder: 6, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Please sign the affidavit and send it back together with a certified copy of your ID.' },

    // CLAIM LODGED
    { slug: 'claim_lodged', label: 'Claim Lodged', phase: 'claim', sortOrder: 7, defaultNote: 'We have diarized our file for 120 days for the RAF to assess the claim.', requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Your claim has been lodged with the RAF. We have set a 120-day follow-up period.' },
    { slug: 'claim_documents_returned', label: 'Claim Documents Returned', phase: 'claim', sortOrder: 8, defaultNote: 'We will now bring an application, and will continue with your claim.', requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'Your claim documents have been returned. We are preparing an application.' },

    // LITIGATION
    { slug: 'drafting_summons', label: 'Drafting Summons (Advocate Review)', phase: 'litigation', sortOrder: 9, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We are drafting the Summons for advocate review.' },
    { slug: 'summons_issued_served', label: 'Summons Issued & Served', phase: 'litigation', sortOrder: 10, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'The Summons has been issued and served on the RAF.' },
    { slug: 'matter_defended', label: 'Matter Defended', phase: 'litigation', sortOrder: 11, defaultNote: 'We now have to mediate with RAF.', requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'The RAF has entered a defence. We will proceed to mediation.' },
    { slug: 'proceeding_default', label: 'Proceeding on Default Basis', phase: 'litigation', sortOrder: 12, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We are proceeding on a default basis.' },
    { slug: 'waiting_application_date', label: 'Waiting for Application Date', phase: 'litigation', sortOrder: 13, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We are waiting for the court to provide a date.' },
    { slug: 'followed_up_court_date', label: 'Followed Up Court Date', phase: 'litigation', sortOrder: 14, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We have followed up with the court regarding the date.' },
    { slug: 'application_default_judgment', label: 'Application for Default Judgment', phase: 'litigation', sortOrder: 15, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We are bringing an application for Default Judgment.' },
    { slug: 'applied_default_judgment_date', label: 'Applied for Default Judgment Date', phase: 'litigation', sortOrder: 16, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We have applied for a Default Judgment date.' },

    // COURT
    { slug: 'default_judgment_merits', label: 'Default Judgment Date: Merits Only', phase: 'court', sortOrder: 17, requiresNote: true, requiresDate: true, requiresClientAction: false, clientMessage: 'A court date has been set for Default Judgment on merits.' },
    { slug: 'default_judgment_quantum', label: 'Default Judgment Date: Quantum Only', phase: 'court', sortOrder: 18, requiresNote: true, requiresDate: true, requiresClientAction: false, clientMessage: 'A court date has been set for Default Judgment on quantum.' },
    { slug: 'default_judgment_merits_quantum', label: 'Default Judgment Date: Merits & Quantum', phase: 'court', sortOrder: 19, requiresNote: true, requiresDate: true, requiresClientAction: false, clientMessage: 'A court date has been set for Default Judgment on merits and quantum.' },
    { slug: 'client_send_documents', label: 'Client to Send Documents', phase: 'court', sortOrder: 20, requiresNote: true, requiresDate: false, requiresClientAction: true, clientMessage: 'We require certain documents from you. Please see the list and submit them urgently.' },
    { slug: 'client_sign_discovery', label: 'Client to Sign Discovery Affidavit', phase: 'court', sortOrder: 21, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Please sign the Discovery Affidavit and return it to our offices.' },
    { slug: 'client_sign_damages', label: 'Client to Sign Damages Affidavit', phase: 'court', sortOrder: 22, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Please sign the Damages Affidavit and urgently return it to our offices.' },
    { slug: 'matter_heard', label: 'Matter Heard', phase: 'court', sortOrder: 23, requiresNote: true, requiresDate: false, requiresClientAction: false, clientMessage: 'Your matter has been heard. Your attorney will contact you regarding the outcome.' },

    // RAF DAMAGES
    { slug: 'raf_undecided_general', label: 'RAF Undecided on General Damages', phase: 'raf_damages', sortOrder: 24, defaultNote: 'We will now bring an application.', requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'The RAF has not yet decided on General Damages. We are preparing an application.' },
    { slug: 'raf_rejected_general', label: 'RAF Rejected General Damages', phase: 'raf_damages', sortOrder: 25, defaultNote: 'We will refer your matter to the HPCSA.', requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'The RAF has rejected your General Damages claim. We are referring to the HPCSA.' },
    { slug: 'raf_accepted_general', label: 'RAF Accepted General Damages', phase: 'raf_damages', sortOrder: 26, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'The RAF has accepted your General Damages claim.' },
    { slug: 'default_judgment_general_damages', label: 'Default Judgment Date: General Damages', phase: 'court', sortOrder: 27, requiresNote: true, requiresDate: true, requiresClientAction: false, clientMessage: 'A court date has been set for Default Judgment on General Damages.' },
    { slug: 'awaiting_general_damages_date', label: 'Awaiting General Damages Date', phase: 'raf_damages', sortOrder: 28, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We are awaiting a court date for General Damages.' },
    { slug: 'applied_raf_undertaking', label: 'Applied to RAF for Undertaking', phase: 'raf_damages', sortOrder: 29, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We have applied to the RAF for an Undertaking.' },
    { slug: 'no_undertaking_received', label: 'No Undertaking from RAF', phase: 'raf_damages', sortOrder: 30, defaultNote: 'We will bring an application.', requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'No undertaking received from the RAF. We are preparing an application.' },
    { slug: 'waiting_undertaking_date', label: 'Waiting for Undertaking Date', phase: 'raf_damages', sortOrder: 31, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We are waiting for a date regarding your undertaking.' },

    // SETTLEMENT
    { slug: 'client_provide_bank_letter', label: 'Client to Provide Bank Letter', phase: 'settlement', sortOrder: 32, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'Please provide a bank confirmation letter for payment processing.' },
    { slug: 'client_attend_expert', label: 'Client to Attend Expert Appointments', phase: 'settlement', sortOrder: 33, requiresNote: false, requiresDate: false, requiresClientAction: true, clientMessage: 'You need to attend expert appointments. We will contact you to arrange details.' },
    { slug: 'demanded_interest_payment', label: 'Demanded Interest Payment from RAF', phase: 'settlement', sortOrder: 34, requiresNote: false, requiresDate: false, requiresClientAction: false, clientMessage: 'We have demanded payment of interest on the capital amount owed to you.' },
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

export function getPhaseProgress(slug: string): { current: number; total: number; percentage: number } {
    const config = getStatusConfig(slug);
    if (!config) return { current: 0, total: 6, percentage: 0 };

    const phases: StatusPhase[] = ['intake', 'claim', 'litigation', 'court', 'raf_damages', 'settlement'];
    const phaseIndex = phases.indexOf(config.phase);
    return {
        current: phaseIndex + 1,
        total: 6,
        percentage: Math.round(((phaseIndex + 1) / 6) * 100),
    };
}

export function getStatusesByPhase(phase: StatusPhase): StatusConfig[] {
    return RAF_STATUSES.filter(s => s.phase === phase).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isClientActionRequired(slug: string): boolean {
    return getStatusConfig(slug)?.requiresClientAction || false;
}
