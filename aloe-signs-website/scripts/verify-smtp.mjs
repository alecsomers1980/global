import { config } from 'dotenv';
config({ path: '.env.local' });
import nodemailer from 'nodemailer';

const base = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
};

console.log(`host=${base.host} port=${base.port} secure=${base.secure} user=${base.auth.user}\n`);

async function attempt(label, extra) {
  const t = nodemailer.createTransport({ ...base, ...extra, connectionTimeout: 20000 });
  try {
    await t.verify();
    console.log(`${label}: CONNECTED + AUTHENTICATED`);
    return true;
  } catch (e) {
    console.log(`${label}: FAILED — ${e.message}${e.code ? ` [${e.code}]` : ''}`);
    return false;
  }
}

const asShipped = await attempt('1. exactly as the app is configured today', {});
const ignoringCert = await attempt('2. same, but ignoring cert validity', { tls: { rejectUnauthorized: false } });

console.log('\n--- conclusion ---');
if (!asShipped && ignoringCert) {
  console.log('Credentials and mail server are FINE. The ONLY thing blocking mail is the expired certificate.');
} else if (asShipped) {
  console.log('Mail works as configured — the earlier failure was not reproducible.');
} else {
  console.log('Failed even ignoring the cert — there is a second problem beyond the certificate.');
}
