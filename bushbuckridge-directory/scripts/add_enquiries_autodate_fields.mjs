import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const col = await pb.collections.getOne('enquiries');
    const fields = (col.fields || col.schema).map((f) => ({ ...f }));
    const have = new Set(fields.map((f) => f.name));
    const toAdd = [];
    if (!have.has('created')) toAdd.push({ name: 'created', type: 'autodate', onCreate: true, onUpdate: false });
    if (!have.has('updated')) toAdd.push({ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true });

    if (toAdd.length === 0) {
        console.log('enquiries: already has created/updated, skipping schema update');
    } else {
        await pb.collections.update(col.id, { fields: [...fields, ...toAdd] });
        console.log('enquiries: added ->', toAdd.map((f) => f.name).join(', '));
    }

    // Existing records predate the field and won't have a created/updated value
    // backfilled automatically, so recreate them to pick up real timestamps.
    const existing = await pb.collection('enquiries').getFullList();
    for (const rec of existing) {
        const { id, collectionId, collectionName, created, updated, ...data } = rec;
        await pb.collection('enquiries').delete(id);
        await pb.collection('enquiries').create(data);
        console.log('enquiries: recreated ->', data.business_name || data.contact_person || id);
    }
}

main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
