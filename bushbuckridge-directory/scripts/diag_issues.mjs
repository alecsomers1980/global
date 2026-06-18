import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

function dumpCol(c) {
    console.log(`\n=== ${c.name} ===`);
    console.log(`  list:${JSON.stringify(c.listRule)} view:${JSON.stringify(c.viewRule)} create:${JSON.stringify(c.createRule)} update:${JSON.stringify(c.updateRule)} delete:${JSON.stringify(c.deleteRule)}`);
    const fields = c.fields || c.schema || [];
    for (const f of fields) {
        console.log(`  - ${f.name} (${f.type}) required=${f.required}`);
    }
}

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    for (const name of ['events', 'payments', 'subscriptions']) {
        try {
            const c = await pb.collections.getOne(name);
            dumpCol(c);
        } catch (e) {
            console.log(`\n=== ${name} === MISSING: ${e.message}`);
        }
    }

    // Try creating an event as superadmin (then delete) to see required-field errors
    console.log('\n--- test create event (superadmin) ---');
    try {
        const ev = await pb.collection('events').create({
            title: 'DIAG TEST', description: 'x', date: '2026-07-01', time: '10:00',
            venue: 'x', cost: 'Free', contact_info: 'x', is_featured: false,
        });
        console.log('event create OK', ev.id);
        await pb.collection('events').delete(ev.id);
        console.log('cleaned up');
    } catch (e) {
        console.log('event create FAIL', e.message, JSON.stringify(e.data));
    }

    console.log('\n--- test create business (superadmin) ---');
    try {
        const b = await pb.collection('businesses').create({
            name: 'DIAG TEST', sector: '', area: '', phone: '', whatsapp: '', email: '',
            website: '', description: '', package_tier: 'standard', status: 'active',
            is_featured: false, is_verified: false,
        });
        console.log('business create OK', b.id);
        await pb.collection('businesses').delete(b.id);
        console.log('cleaned up');
    } catch (e) {
        console.log('business create FAIL', e.message, JSON.stringify(e.data));
    }

    // sample a payment record to check fields used by revenue page
    console.log('\n--- sample payment record ---');
    try {
        const p = await pb.collection('payments').getList(1, 1);
        console.log('payments totalItems:', p.totalItems);
        if (p.items[0]) console.log('sample:', JSON.stringify(p.items[0]));
    } catch (e) {
        console.log('payments read FAIL', e.message);
    }
}

main().catch(e => console.error('ERR', e.message, e.data || ''));
