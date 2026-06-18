import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const ADMIN = '@request.auth.is_admin = true';

// Collections fully managed by the admin UI only (no server-flow / public writes).
const ADMIN_ONLY = ['sectors', 'areas', 'jobs', 'opportunities', 'events', 'spotlight_articles', 'editor_spotlight', 'settings'];

async function setRules(name, rules) {
    const c = await pb.collections.getOne(name);
    await pb.collections.update(c.id, rules);
}

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    // 1) admin-only content collections: lock all writes to is_admin (keep list/view public)
    for (const name of ADMIN_ONLY) {
        await setRules(name, { createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN });
        console.log(`${name}: create/update/delete -> is_admin`);
    }

    // 2) enquiries: public contact form may CREATE; only admin may update/delete
    await setRules('enquiries', { createRule: '', updateRule: ADMIN, deleteRule: ADMIN });
    console.log('enquiries: create="" (public), update/delete -> is_admin');

    // 3) businesses: keep self-service create + (webhook-dependent) update open; lock DELETE to admin
    await setRules('businesses', { deleteRule: ADMIN });
    console.log('businesses: delete -> is_admin (create/update unchanged)');

    // 4) payments: add an autodate `created` field (onCreate) if missing
    const pay = await pb.collections.getOne('payments');
    const fields = (pay.fields || pay.schema).map(f => ({ ...f }));
    if (!fields.some(f => f.name === 'created')) {
        fields.push({ name: 'created', type: 'autodate', onCreate: true, onUpdate: false });
        await pb.collections.update(pay.id, { fields });
        console.log('payments: added autodate `created` field');
    } else {
        console.log('payments: `created` already exists');
    }

    // verify
    console.log('\n=== verify ===');
    for (const name of [...ADMIN_ONLY, 'enquiries', 'businesses', 'payments']) {
        const c = await pb.collections.getOne(name);
        const rr = (v) => v === null ? 'NULL' : v === '' ? '""' : v;
        console.log(`${name}: create=${rr(c.createRule)} | update=${rr(c.updateRule)} | delete=${rr(c.deleteRule)}`);
    }
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
