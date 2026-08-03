import { Column, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, labelCellStyle, valueCellStyle } from "./EmailLayout";

interface ContactEnquiryEmailProps {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    practiceArea: string;
    office?: string;
    message: string;
}

export function ContactEnquiryEmail({ firstName, lastName, email, phone, practiceArea, office, message }: ContactEnquiryEmailProps) {
    return (
        <EmailLayout preview={`New enquiry from ${firstName} ${lastName}`} titleBarText="New Contact Enquiry">
            <Text style={{ margin: "0 0 16px" }}>
                <strong>New enquiry from the website contact form:</strong>
            </Text>
            <Section style={{ backgroundColor: "#f1f5f9", borderRadius: "6px", padding: "4px 16px", margin: "0 0 16px" }}>
                <Row>
                    <Column style={labelCellStyle}>Name</Column>
                    <Column style={valueCellStyle}>{firstName} {lastName}</Column>
                </Row>
                <Row>
                    <Column style={labelCellStyle}>Email</Column>
                    <Column style={valueCellStyle}>{email}</Column>
                </Row>
                {phone && (
                    <Row>
                        <Column style={labelCellStyle}>Phone</Column>
                        <Column style={valueCellStyle}>{phone}</Column>
                    </Row>
                )}
                <Row>
                    <Column style={labelCellStyle}>Practice Area</Column>
                    <Column style={valueCellStyle}>{practiceArea}</Column>
                </Row>
                {office && (
                    <Row>
                        <Column style={labelCellStyle}>Office</Column>
                        <Column style={valueCellStyle}>{office}</Column>
                    </Row>
                )}
            </Section>
            <Section style={{ backgroundColor: "#f8fafc", padding: "16px", borderLeft: "4px solid #C5A059", borderRadius: "4px", margin: "0 0 16px" }}>
                <Text style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message}</Text>
            </Section>
            <Text style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Reply directly to this email to respond to the client.</Text>
        </EmailLayout>
    );
}

export default ContactEnquiryEmail;
