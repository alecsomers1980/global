import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const admin = new PocketBase(URL);

const EMAIL = `ruletest_${Date.now()}@example.com`;
const PASS = 'TestPass12345!';

async function main() {
    await admin.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    // create a throwaway user with is_admin = true
    const user = await admin.collection('users').create({
        email: EMAIL, password: PASS, passwordConfirm: PASS, is_admin: true, verified: true,
    });
    console.log('created temp user', user.id, 'is_admin=true');

    // auth as that user (separate client, no admin privileges)
    const asUser = new PocketBase(URL);
    await asUser.collection('users').authWithPassword(EMAIL, PASS);
    console.log('token is_admin =', asUser.authStore.model?.is_admin);

    // 1) admin user SHOULD be able to create an event
    let evId;
    try {
        const ev = await asUser.collection('events').create({ title: 'RULE TEST', slug: 'rule-test-' + Date.now(), date: '2026-08-01' });
        evId = ev.id;
        console.log('PASS: admin-token create event OK');
    } catch (e) {
        console.log('FAIL: admin-token create event blocked ->', e.message);
    }
    if (evId) { await admin.collection('events').delete(evId); }

    // 2) demote to is_admin=false, re-auth, SHOULD be blocked
    await admin.collection('users').update(user.id, { is_admin: false });
    const asPlain = new PocketBase(URL);
    await asPlain.collection('users').authWithPassword(EMAIL, PASS);
    try {
        const ev = await asPlain.collection('events').create({ title: 'SHOULD FAIL', slug: 'fail-' + Date.now(), date: '2026-08-01' });
        console.log('FAIL: non-admin was able to create event!', ev.id);
        await admin.collection('events').delete(ev.id);
    } catch (e) {
        console.log('PASS: non-admin create event correctly blocked (', e.status, ')');
    }

    // 3) anonymous (no auth) SHOULD be blocked
    const anon = new PocketBase(URL);
    try {
        const ev = await anon.collection('events').create({ title: 'ANON FAIL', slug: 'anon-' + Date.now(), date: '2026-08-01' });
        console.log('FAIL: anonymous created event!', ev.id);
        await admin.collection('events').delete(ev.id);
    } catch (e) {
        console.log('PASS: anonymous create event correctly blocked (', e.status, ')');
    }

    // 4) anonymous can still READ businesses/events (public site)
    try {
        await anon.collection('businesses').getList(1, 1);
        await anon.collection('events').getList(1, 1);
        console.log('PASS: anonymous READ businesses/events still works');
    } catch (e) {
        console.log('FAIL: anonymous read broke ->', e.message);
    }

    // 5) anonymous can still CREATE an enquiry (contact form)
    try {
        const enq = await anon.collection('enquiries').create({});
        console.log('PASS: anonymous enquiry create OK', enq.id);
        await admin.collection('enquiries').delete(enq.id);
    } catch (e) {
        console.log('NOTE: anonymous enquiry create ->', e.status, e.message, '(may be due to required fields, not rules)');
    }

    // cleanup temp user
    await admin.collection('users').delete(user.id);
    console.log('cleaned up temp user');
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
