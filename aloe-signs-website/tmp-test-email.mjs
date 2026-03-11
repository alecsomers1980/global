import nodemailer from 'nodemailer';

const smtpHost = "smtp.aloesigns.co.za";
const smtpPort = 587;
const smtpUser = "shop@aloesigns.co.za";
const smtpPass = "8w54a60973E6hG";

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // true for 465, false for other ports
    auth: { user: smtpUser, pass: smtpPass },
});

async function testEmail(emailAddress) {
    console.log(`Sending test email to ${emailAddress}...`);

    try {
        const info = await transporter.sendMail({
            from: `"Aloe Signs Registration" <${smtpUser}>`,
            to: emailAddress,
            subject: 'Support Test - Aloe Signs',
            text: 'This is a test email sent during debugging.',
            html: '<b>This is a test email sent during debugging.</b>'
        });
        console.log(`Email sent successfully to ${emailAddress}:`, info.messageId);
    } catch (error) {
        console.error(`Email sending failed for ${emailAddress}:`, error.message || error);
    }
}

async function run() {
    await testEmail("alecs@precisionmed.co.za");
    console.log("-------------------");
    await testEmail("alecs@precisionmedia.co.za"); // trying the alternate spelling
}

run();
