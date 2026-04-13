import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function inspectFields() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        const users = await pb.collections.getOne('users');
        console.log('--- Fields Array Structure ---');
        console.log(JSON.stringify(users.fields, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

inspectFields();
