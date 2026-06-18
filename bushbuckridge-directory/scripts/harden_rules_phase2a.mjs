import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const admin = new PocketBase(URL);
// admin sees all; business owner sees their own. viewRule stays open for the unauth webhook getOne().
const LIST = '@request.auth.is_admin = true || business.owner = @request.auth.id';

async function main() {
    await admin.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    for (const name of ['payments', 'subscriptions']) {
        const c = await admin.collections.getOne(name);
        await admin.collections.update(c.id, { listRule: LIST });
        const c2 = await admin.collections.getOne(name);
        console.log(`${name}: listRule=${JSON.stringify(c2.listRule)} viewRule=${JSON.stringify(c2.viewRule)}`);
    }

    // ---- verify ----
    console.log('\n=== verify ===');
    const anon = new PocketBase(URL);

    // 1) anonymous can NO LONGER list payments/subscriptions
    for (const name of ['payments', 'subscriptions']) {
        try {
            const r = await anon.collection(name).getList(1, 1);
            console.log(`FAIL: anon listed ${name} (${r.totalItems} items)`);
        } catch (e) {
            console.log(`PASS: anon list ${name} blocked (${e.status})`);
        }
    }

    // 2) admin (is_admin user token) CAN still list
    const EMAIL = `rt2_${Date.now()}@example.com`, PASS = 'TestPass12345!';
    const u = await admin.collection('users').create({ email: EMAIL, password: PASS, passwordConfirm: PASS, is_admin: true, verified: true });
    const asAdmin = new PocketBase(URL);
    await asAdmin.collection('users').authWithPassword(EMAIL, PASS);
    try {
        await asAdmin.collection('payments').getFullList();
        await asAdmin.collection('subscriptions').getFullList();
        console.log('PASS: admin-token list payments/subscriptions OK');
    } catch (e) {
        console.log('FAIL: admin-token list blocked ->', e.message);
    }

    // 3) webhook dependency: anonymous getOne(view) still works — grab an existing id as admin then read anon
    try {
        const some = await admin.collection('payments').getList(1, 1);
        if (some.items[0]) {
            await anon.collection('payments').getOne(some.items[0].id);
            console.log('PASS: anon getOne(payment) still works (webhook viewRule intact)');
        } else {
            console.log('NOTE: no payments to test getOne');
        }
    } catch (e) {
        console.log('FAIL: anon getOne(payment) broke ->', e.status, e.message);
    }

    await admin.collection('users').delete(u.id);
    console.log('cleaned up temp user');
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
