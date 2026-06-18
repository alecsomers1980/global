import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const svc = new PocketBase(URL);
const sup = new PocketBase(URL);

async function main() {
    await sup.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');
    await svc.collection('users').authWithPassword(process.env.POCKETBASE_SERVICE_EMAIL, process.env.POCKETBASE_SERVICE_PASSWORD);
    console.log('service is_admin =', svc.authStore.model.is_admin);

    const created = { biz: null, sub: null, pay: null };
    try {
        // mimic setup/initiate: service creates business(setup uses user, but service is_admin can too), sub, payment
        created.biz = (await svc.collection('businesses').create({ name: 'SVC PATH TEST', status: 'pending', package_tier: 'basic', is_featured: false, is_verified: false })).id;
        console.log('businesses.create  OK');
        created.sub = (await svc.collection('subscriptions').create({ business: created.biz, tier: 'basic', status: 'pending', amount_cents: 19900 })).id;
        console.log('subscriptions.create OK');
        created.pay = (await svc.collection('payments').create({ business: created.biz, subscription: created.sub, amount_cents: 19900, provider: 'yoco', status: 'pending', description: 'svc path test' })).id;
        console.log('payments.create    OK');

        // mimic initiate/setup provider_reference update
        await svc.collection('payments').update(created.pay, { provider_reference: 'ch_test' });
        console.log('payments.update    OK');

        // mimic webhook getOne + updates
        await svc.collection('payments').getOne(created.pay);
        console.log('payments.getOne    OK');
        await svc.collection('payments').update(created.pay, { status: 'successful', paid_at: new Date().toISOString() });
        console.log('payments.update(2) OK');
        await svc.collection('subscriptions').update(created.sub, { status: 'active' });
        console.log('subscriptions.update OK');
        await svc.collection('businesses').update(created.biz, { status: 'active' });
        console.log('businesses.update  OK');
        await svc.collection('businesses').getOne(created.biz);
        console.log('businesses.getOne  OK');

        console.log('\nALL SERVICE-PATH OPERATIONS PASS ✅');
    } catch (e) {
        console.log('\nFAIL ❌', e.status, e.message, JSON.stringify(e.data || {}));
    } finally {
        // cleanup with superadmin (payments.delete is superadmin-only)
        if (created.pay) await sup.collection('payments').delete(created.pay).catch(() => {});
        if (created.sub) await sup.collection('subscriptions').delete(created.sub).catch(() => {});
        if (created.biz) await sup.collection('businesses').delete(created.biz).catch(() => {});
        console.log('cleaned up test records');
    }
}
main().catch(e => console.error('ERR', e.message));
