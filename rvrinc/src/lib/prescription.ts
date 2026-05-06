// Prescription deadline tracking for RAF claims
// The Road Accident Fund has a 3-year prescription period from the accident date

const PRESCRIPTION_YEARS = 3;
const CRITICAL_DAYS = 30;
const WARNING_DAYS = 60;
const APPROACHING_DAYS = 90;

export type PrescriptionRisk = "expired" | "critical" | "warning" | "approaching" | "ok" | "none";

export interface PrescriptionInfo {
    accidentDate: string;
    deadlineDate: Date;
    daysRemaining: number;
    risk: PrescriptionRisk;
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    message: string;
}

export function getPrescriptionInfo(accidentDate: string | null | undefined, caseStatus?: string): PrescriptionInfo | null {
    if (!accidentDate) return null;

    // Don't show alerts for closed or settled cases
    if (caseStatus === "closed") return null;

    const accident = new Date(accidentDate);
    if (isNaN(accident.getTime())) return null;

    // 3-year deadline from accident date
    const deadline = new Date(accident);
    deadline.setFullYear(deadline.getFullYear() + PRESCRIPTION_YEARS);

    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let risk: PrescriptionRisk;
    let label: string;
    let bgColor: string;
    let textColor: string;
    let borderColor: string;
    let message: string;

    if (daysRemaining < 0) {
        risk = "expired";
        label = "PRESCRIPTION EXPIRED";
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        borderColor = "border-red-300";
        message = `The 3-year prescription deadline passed ${Math.abs(daysRemaining)} days ago. Urgent action required — claim may be time-barred.`;
    } else if (daysRemaining <= CRITICAL_DAYS) {
        risk = "critical";
        label = `CRITICAL: ${daysRemaining} days remaining`;
        bgColor = "bg-red-50";
        textColor = "text-red-700";
        borderColor = "border-red-200";
        message = `Only ${daysRemaining} days until the 3-year prescription deadline. Immediate action required.`;
    } else if (daysRemaining <= WARNING_DAYS) {
        risk = "warning";
        label = `WARNING: ${daysRemaining} days remaining`;
        bgColor = "bg-orange-50";
        textColor = "text-orange-700";
        borderColor = "border-orange-200";
        message = `${daysRemaining} days remaining until the prescription deadline. Prioritize this case.`;
    } else if (daysRemaining <= APPROACHING_DAYS) {
        risk = "approaching";
        label = `${daysRemaining} days remaining`;
        bgColor = "bg-yellow-50";
        textColor = "text-yellow-700";
        borderColor = "border-yellow-200";
        message = `${daysRemaining} days until prescription. Begin preparing filings.`;
    } else {
        return null; // No alert needed
    }

    return {
        accidentDate,
        deadlineDate: deadline,
        daysRemaining,
        risk,
        label,
        bgColor,
        textColor,
        borderColor,
        message,
    };
}
