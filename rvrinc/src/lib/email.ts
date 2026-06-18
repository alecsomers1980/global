import { Resend } from "resend";
import * as React from "react";
import { ContactEnquiryEmail } from "@/emails/ContactEnquiryEmail";
import { EnquiryConfirmationEmail } from "@/emails/EnquiryConfirmationEmail";
import { CaseUpdateEmail } from "@/emails/CaseUpdateEmail";
import { PrescriptionAlertEmail } from "@/emails/PrescriptionAlertEmail";
import { AdminNotificationEmail } from "@/emails/AdminNotificationEmail";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@rvrinc.co.za";
const FROM_NAME = process.env.SMTP_FROM_NAME || "RVR Inc. Attorneys";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@rvrinc.co.za";
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.roetsvanrensburg.co.za";

const PRETORIA_EMAIL = "info@rvrinc.co.za";
const MARBLE_HALL_EMAIL = "martie@rvrinc.co.za";

function getResendClient() {
    if (!resend) {
        console.warn("Resend not configured. Emails will not be sent.");
        return null;
    }
    return resend;
}

function resolveContactRecipient(office?: string): string {
    if (office && office.toLowerCase().includes("marble hall")) return MARBLE_HALL_EMAIL;
    return PRETORIA_EMAIL;
}

// ─── Email Functions ────────────────────────────────────────────

/**
 * Send a contact form inquiry to the relevant office, and a confirmation to the sender
 */
export async function sendContactEmail({
    firstName,
    lastName,
    email,
    phone,
    practiceArea,
    office,
    message,
}: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    practiceArea: string;
    office?: string;
    message: string;
}) {
    const client = getResendClient();
    if (!client) {
        console.log("Resend not configured — contact email skipped");
        return { success: false, error: "Email not configured" };
    }

    try {
        await client.emails.send({
            from: FROM,
            to: resolveContactRecipient(office),
            replyTo: email,
            subject: `New Enquiry: ${practiceArea} — ${firstName} ${lastName}`,
            react: React.createElement(ContactEnquiryEmail, { firstName, lastName, email, phone, practiceArea, office, message }),
        });

        await client.emails.send({
            from: FROM,
            to: email,
            subject: "We received your enquiry — RVR Inc.",
            react: React.createElement(EnquiryConfirmationEmail, { firstName, practiceArea }),
        });

        return { success: true };
    } catch (error: any) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a notification to a client about a case update
 */
export async function sendCaseUpdateEmail({
    clientEmail,
    clientName,
    caseNumber,
    caseTitle,
    updateMessage,
}: {
    clientEmail: string;
    clientName: string;
    caseNumber: string;
    caseTitle: string;
    updateMessage: string;
}) {
    const client = getResendClient();
    if (!client) return { success: false, error: "Email not configured" };

    try {
        await client.emails.send({
            from: FROM,
            to: clientEmail,
            subject: `Case Update: ${caseNumber} — ${caseTitle}`,
            react: React.createElement(CaseUpdateEmail, { clientName, caseNumber, caseTitle, updateMessage, siteUrl: SITE_URL }),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Case update email error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send prescription deadline alert to attorney and admin
 */
export async function sendPrescriptionAlertEmail({
    attorneyEmail,
    attorneyName,
    caseNumber,
    caseTitle,
    daysRemaining,
    deadlineDate,
    risk,
}: {
    attorneyEmail: string | null;
    attorneyName: string | null;
    caseNumber: string;
    caseTitle: string;
    daysRemaining: number;
    deadlineDate: Date;
    risk: string;
}) {
    const client = getResendClient();
    if (!client) return { success: false, error: "Email not configured" };

    const isExpired = risk === "expired";

    const recipients = [];
    if (attorneyEmail) recipients.push(attorneyEmail);
    if (!recipients.includes(ADMIN_EMAIL)) recipients.push(ADMIN_EMAIL);

    try {
        await client.emails.send({
            from: FROM,
            to: recipients,
            subject: `[PRESCRIPTION ALERT] ${caseNumber} — ${daysRemaining <= 0 ? "EXPIRED" : daysRemaining + " days remaining"}`,
            react: React.createElement(PrescriptionAlertEmail, {
                attorneyName,
                caseNumber,
                caseTitle,
                daysRemaining,
                deadlineDateFormatted: deadlineDate.toLocaleDateString("en-ZA"),
                isExpired,
                siteUrl: SITE_URL,
            }),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Prescription alert email error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a notification to admin/staff about internal events
 */
export async function sendAdminNotification({
    subject,
    message,
    recipientEmail,
}: {
    subject: string;
    message: string;
    recipientEmail?: string;
}) {
    const client = getResendClient();
    if (!client) return { success: false, error: "Email not configured" };

    try {
        await client.emails.send({
            from: FROM,
            to: recipientEmail || ADMIN_EMAIL,
            subject: `[RVR Admin] ${subject}`,
            react: React.createElement(AdminNotificationEmail, { subject, message }),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Admin notification error:", error);
        return { success: false, error: error.message };
    }
}
