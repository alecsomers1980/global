import nodemailer from 'nodemailer';

const smtpHost = "smtp.aloesigns.co.za";
const smtpPort = 587;
const smtpUser = "shop@aloesigns.co.za";
const smtpPass = "8w54a60973E6hG";

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
});

async function testEmail() {
    const testEmail = "team@aloesigns.co.za"; // Sending to an internal address for testing
    console.log(`Sending test email to ${testEmail}...`);

    try {
        const info = await transporter.sendMail({
            from: `"Aloe Signs" <${smtpUser}>`, // Using simple from for test
            to: testEmail,
            subject: 'SMTP Test - Aloe Signs',
            text: 'This is a test email to verify SMTP configuration.',
            html: '<b>This is a test email to verify SMTP configuration.</b>'
        });
        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Email sending FAILED:", error);
    }
}

testEmail();
