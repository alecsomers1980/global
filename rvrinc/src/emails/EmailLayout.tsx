import { Body, Column, Container, Head, Html, Img, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";

const LOGO_URL = "https://www.roetsvanrensburg.co.za/images/logo.png";

const COLORS = {
    navy: "#0F172A",
    gold: "#C5A059",
};

export const labelCellStyle: React.CSSProperties = {
    padding: "8px 0",
    fontWeight: 600,
    width: "160px",
    textAlign: "left",
    verticalAlign: "top",
};

export const valueCellStyle: React.CSSProperties = {
    padding: "8px 0",
    textAlign: "left",
    verticalAlign: "top",
};

interface EmailLayoutProps {
    preview: string;
    titleBarText: string;
    children: React.ReactNode;
}

export function EmailLayout({ preview, titleBarText, children }: EmailLayoutProps) {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={{ backgroundColor: "#f4f5f7", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", margin: 0, padding: 0 }}>
                <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
                    {/* Header */}
                    <Section style={{ backgroundColor: "#ffffff", padding: "28px 40px", textAlign: "center", borderBottom: `3px solid ${COLORS.gold}` }}>
                        <Img src={LOGO_URL} width="200" alt="Roets & Van Rensburg Inc." style={{ margin: "0 auto" }} />
                    </Section>

                    {/* Title Bar */}
                    <Section style={{ backgroundColor: COLORS.gold, padding: "12px 40px" }}>
                        <Text style={{ color: COLORS.navy, fontSize: "16px", margin: 0, fontWeight: 600 }}>{titleBarText}</Text>
                    </Section>

                    {/* Body */}
                    <Section style={{ padding: "32px 40px", color: "#334155", fontSize: "15px", lineHeight: "1.6" }}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={{ backgroundColor: COLORS.navy, padding: "28px 40px" }}>
                        <Text style={{ color: COLORS.gold, fontWeight: 700, fontSize: "13px", margin: "0 0 12px", letterSpacing: "1px" }}>
                            ROETS &amp; VAN RENSBURG INC.
                        </Text>
                        <Row>
                            <Column>
                                <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 2px" }}>Pretoria (Head Office)</Text>
                                <Text style={{ color: "#cbd5e1", fontSize: "12px", margin: 0 }}>087 150 5683 &bull; info@rvrinc.co.za</Text>
                            </Column>
                            <Column>
                                <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 2px" }}>Marble Hall</Text>
                                <Text style={{ color: "#cbd5e1", fontSize: "12px", margin: 0 }}>013 261 7187 &bull; martie@rvrinc.co.za</Text>
                            </Column>
                        </Row>
                        <Text style={{ color: "#64748b", fontSize: "11px", margin: "16px 0 0" }}>
                            Office Hours: Mon &ndash; Fri, 08:00 &ndash; 16:00
                        </Text>
                        <Text style={{ color: "#475569", fontSize: "11px", margin: "8px 0 0" }}>
                            This email is confidential. If you received it in error, please delete it immediately.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
