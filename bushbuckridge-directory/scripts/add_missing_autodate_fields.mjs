import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function fixCollection(name) {
    const col = await pb.collections.getOne(name);
    const fields = (col.fields || col.schema).map((f) => ({ ...f }));
    const have = new Set(fields.map((f) => f.name));
    const toAdd = [];
    if (!have.has('created')) toAdd.push({ name: 'created', type: 'autodate', onCreate: true, onUpdate: false });
    if (!have.has('updated')) toAdd.push({ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true });

    if (toAdd.length === 0) {
        console.log(`${name}: already has created/updated, skipping`);
        return;
    }
    await pb.collections.update(col.id, { fields: [...fields, ...toAdd] });
    console.log(`${name}: added ->`, toAdd.map((f) => f.name).join(', '));
}

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);
    for (const name of ['editor_spotlight', 'opportunities', 'spotlight_articles']) {
        await fixCollection(name);
    }
}

main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
