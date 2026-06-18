import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    const before = await pb.collections.getOne('businesses');
    console.log('deleteRule before:', JSON.stringify(before.deleteRule));

    await pb.collections.update('businesses', { deleteRule: '' });

    const after = await pb.collections.getOne('businesses');
    console.log('deleteRule after :', JSON.stringify(after.deleteRule));
}

main().catch(e => console.error('ERR', e.message, e.data || ''));
