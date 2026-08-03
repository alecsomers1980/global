import { Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface EnquiryConfirmationEmailProps {
    firstName: string;
    practiceArea: string;
}

export function EnquiryConfirmationEmail({ firstName, practiceArea }: EnquiryConfirmationEmailProps) {
    return (
        <EmailLayout preview="We received your enquiry — RVR Inc." titleBarText="Enquiry Received">
            <Text style={{ margin: "0 0 12px" }}>Dear {firstName},</Text>
            <Text style={{ margin: "0 0 12px" }}>
                Thank you for contacting Roets &amp; Van Rensburg Incorporated. We have received your enquiry regarding <strong>{practiceArea}</strong>.
            </Text>
            <Text style={{ margin: "0 0 12px" }}>
                A member of our team will review your message and reply as soon as we possibly can.
            </Text>
            <Text style={{ margin: "24px 0 0" }}>
                Kind regards,
                <br />
                <strong>Roets &amp; Van Rensburg Inc.</strong>
            </Text>
        </EmailLayout>
    );
}

export default EnquiryConfirmationEmail;
