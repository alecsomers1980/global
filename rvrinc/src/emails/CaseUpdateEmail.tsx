import { Column, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, labelCellStyle, valueCellStyle } from "./EmailLayout";

interface CaseUpdateEmailProps {
    clientName: string;
    caseNumber: string;
    caseTitle: string;
    updateMessage: string;
    siteUrl: string;
}

export function CaseUpdateEmail({ clientName, caseNumber, caseTitle, updateMessage, siteUrl }: CaseUpdateEmailProps) {
    return (
        <EmailLayout preview={`Case Update: ${caseNumber} — ${caseTitle}`} titleBarText="Case Update">
            <Text style={{ margin: "0 0 12px" }}>Dear {clientName},</Text>
            <Text style={{ margin: "0 0 12px" }}>There is an update on your case:</Text>
            <Section style={{ backgroundColor: "#f1f5f9", borderRadius: "6px", padding: "4px 16px", margin: "0 0 16px" }}>
                <Row>
                    <Column style={labelCellStyle}>Case Number</Column>
                    <Column style={valueCellStyle}>{caseNumber}</Column>
                </Row>
                <Row>
                    <Column style={labelCellStyle}>Case Title</Column>
                    <Column style={valueCellStyle}>{caseTitle}</Column>
                </Row>
            </Section>
            <Section style={{ backgroundColor: "#f8fafc", padding: "16px", borderLeft: "4px solid #C5A059", borderRadius: "4px", margin: "0 0 16px" }}>
                <Text style={{ margin: 0 }}>{updateMessage}</Text>
            </Section>
            <Text style={{ margin: "0 0 12px" }}>
                You can view your case status using the{" "}
                <a href={siteUrl} style={{ color: "#C5A059", fontWeight: 600 }}>
                    Case Status Lookup
                </a>{" "}
                on our website.
            </Text>
            <Text style={{ margin: "24px 0 0" }}>
                Kind regards,
                <br />
                <strong>Roets &amp; Van Rensburg Inc.</strong>
            </Text>
        </EmailLayout>
    );
}

export default CaseUpdateEmail;
