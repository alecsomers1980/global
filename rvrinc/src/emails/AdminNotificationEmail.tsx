import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AdminNotificationEmailProps {
    subject: string;
    message: string;
}

export function AdminNotificationEmail({ subject, message }: AdminNotificationEmailProps) {
    return (
        <EmailLayout preview={subject} titleBarText={subject}>
            <Section style={{ backgroundColor: "#f8fafc", padding: "16px", borderLeft: "4px solid #C5A059", borderRadius: "4px" }}>
                <Text style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message}</Text>
            </Section>
        </EmailLayout>
    );
}

export default AdminNotificationEmail;
