import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, react }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Everest Motoring <onboarding@resend.dev>',
      to,
      subject,
      react,
    });

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
