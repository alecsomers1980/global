import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    // ---- EVENTS: add missing fields, relax slug, open rules ----
    const events = await pb.collections.getOne('events');
    const eFields = (events.fields || events.schema).map(f => ({ ...f }));

    // relax slug requirement (app generates it, but be safe)
    const slug = eFields.find(f => f.name === 'slug');
    if (slug) slug.required = false;

    const have = new Set(eFields.map(f => f.name));
    const toAdd = [
        { name: 'time', type: 'text' },
        { name: 'venue', type: 'text' },
        { name: 'cost', type: 'text' },
        { name: 'contact_info', type: 'text' },
        { name: 'description', type: 'editor' },
        { name: 'is_featured', type: 'bool' },
    ].filter(f => !have.has(f.name));

    await pb.collections.update(events.id, {
        fields: [...eFields, ...toAdd],
        createRule: '',
        updateRule: '',
        deleteRule: '',
    });
    console.log('events: added fields ->', toAdd.map(f => f.name).join(', ') || '(none)');

    // ---- SUBSCRIPTIONS: add 'suspended' status, open deleteRule ----
    const subs = await pb.collections.getOne('subscriptions');
    const sFields = (subs.fields || subs.schema).map(f => ({ ...f }));
    const status = sFields.find(f => f.name === 'status');
    const vals = status.values || status.options?.values || [];
    if (!vals.includes('suspended')) {
        if (status.values) status.values = [...vals, 'suspended'];
        else status.options = { ...status.options, values: [...vals, 'suspended'] };
    }
    await pb.collections.update(subs.id, { fields: sFields, deleteRule: '' });
    console.log('subscriptions: status values ->', JSON.stringify(status.values || status.options?.values), '| deleteRule = ""');

    // ---- verify ----
    const e2 = await pb.collections.getOne('events');
    console.log('\nevents fields now:', (e2.fields || e2.schema).map(f => f.name).join(', '));
    console.log('events rules: create', JSON.stringify(e2.createRule), 'update', JSON.stringify(e2.updateRule), 'delete', JSON.stringify(e2.deleteRule));
}

main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
