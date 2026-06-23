import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const col = await pb.collections.getOne('jobs');
    const fields = (col.fields || col.schema).map((f) => ({ ...f }));
    const have = new Set(fields.map((f) => f.name));

    if (!have.has('status')) {
        await pb.collections.update(col.id, {
            fields: [...fields, { name: 'status', type: 'select', required: false, maxSelect: 1, values: ['pending', 'published'] }],
        });
        console.log('jobs: added -> status');
    } else {
        console.log('jobs: already has status, skipping schema update');
    }

    // Existing jobs predate the field; mark them published so they stay live.
    const existing = await pb.collection('jobs').getFullList();
    let backfilled = 0;
    for (const rec of existing) {
        if (!rec.status) {
            await pb.collection('jobs').update(rec.id, { status: 'published' });
            backfilled++;
        }
    }
    console.log(`jobs: backfilled ${backfilled} record(s) -> published`);
}

main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
