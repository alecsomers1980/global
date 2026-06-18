import PocketBase from 'pocketbase';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const EMAIL = 'service@dbib.co.za';

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    // already exists?
    try {
        const existing = await pb.collection('users').getFirstListItem(`email = "${EMAIL}"`);
        console.log('Service account already exists:', existing.id, '| is_admin =', existing.is_admin);
        console.log('If you need the password, delete it and re-run, or reset via admin UI.');
        return;
    } catch {}

    const password = crypto.randomBytes(24).toString('base64url'); // strong random
    const user = await pb.collection('users').create({
        email: EMAIL,
        password,
        passwordConfirm: password,
        is_admin: true,
        verified: true,
        name: 'Payment Service',
    });
    console.log('Created service account:', user.id);
    console.log('POCKETBASE_SERVICE_EMAIL=' + EMAIL);
    console.log('POCKETBASE_SERVICE_PASSWORD=' + password);
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
