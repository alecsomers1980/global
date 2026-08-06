import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [, , email, password] = process.argv;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin-user.mjs <email> <password>');
  console.error('Password is a CLI arg, not written to any file -- pick one and pass it directly.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // no email flow for a single manually-provisioned operator
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Created admin user ${data.user.email} (id ${data.user.id}).`);
