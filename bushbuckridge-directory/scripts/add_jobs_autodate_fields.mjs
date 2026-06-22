import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const jobs = await pb.collections.getOne('jobs');
    const fields = (jobs.fields || jobs.schema).map((f) => ({ ...f }));

    const have = new Set(fields.map((f) => f.name));
    const toAdd = [];
    if (!have.has('created')) {
        toAdd.push({ name: 'created', type: 'autodate', onCreate: true, onUpdate: false });
    }
    if (!have.has('updated')) {
        toAdd.push({ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true });
    }

    if (toAdd.length === 0) {
        console.log('jobs: created/updated already present, skipping');
        return;
    }

    await pb.collections.update(jobs.id, { fields: [...fields, ...toAdd] });
    console.log('jobs: added ->', toAdd.map((f) => f.name).join(', '));
}

main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
