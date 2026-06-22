import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const businesses = await pb.collections.getOne('businesses');
    const fields = (businesses.fields || businesses.schema).map(f => ({ ...f }));

    if (fields.some(f => f.name === 'slug')) {
        console.log('businesses: slug field already exists, skipping');
        return;
    }

    fields.push({ name: 'slug', type: 'text', required: false });

    await pb.collections.update(businesses.id, { fields });
    console.log('businesses: added slug field');
}

main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
