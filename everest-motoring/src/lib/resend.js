import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || 'Everest Motoring <onboarding@resend.dev>';

export const sendEmail = async ({ to, subject, react, scheduledAt }) => {
  try {
    const payload = { from: FROM_ADDRESS, to, subject, react };
    if (scheduledAt) payload.scheduledAt = scheduledAt;

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return { success: false, error: err };
  }
};

export default resend;
