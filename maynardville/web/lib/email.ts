interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via Resend in production, or logs to the console in dev.
 * Will also be used later for workflow notification emails.
 */
export async function sendMail({ to, subject, html }: SendMailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const from = process.env.EMAIL_FROM || "Maynardville <noreply@maynardville.co.za>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error: ${res.status} ${err}`);
    }
  } else {
    // Dev / no API key: log the email content clearly
    console.log(`
------ DEV EMAIL ------
To: ${to}
Subject: ${subject}
HTML:
${html}
----------------------
`);
  }
}