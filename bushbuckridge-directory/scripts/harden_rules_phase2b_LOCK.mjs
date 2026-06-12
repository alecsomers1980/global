// FINAL write-lock for payments/subscriptions/businesses.update.
// !! RUN ONLY AFTER the refactored payment routes (service-client) are DEPLOYED to production. !!
// Before deploy, the live site still runs the old unauthenticated routes and this lock WILL break payments.
// Usage: node scripts/harden_rules_phase2b_LOCK.mjs --confirm
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.argv.includes('--confirm')) {
    console.log('Refusing to run without --confirm. Deploy the refactored payment routes FIRST, then run:');
    console.log('  node scripts/harden_rules_phase2b_LOCK.mjs --confirm');
    process.exit(1);
}

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const ADMIN = '@request.auth.is_admin = true';
const ADMIN_OR_OWNER = '@request.auth.is_admin = true || business.owner = @request.auth.id';

async function set(name, rules) {
    const c = await pb.collections.getOne(name);
    await pb.collections.update(c.id, rules);
    const c2 = await pb.collections.getOne(name);
    const r = (v) => v === null ? 'NULL' : v === '' ? '""' : v;
    console.log(`${name}: list=${r(c2.listRule)} view=${r(c2.viewRule)} create=${r(c2.createRule)} update=${r(c2.updateRule)} delete=${r(c2.deleteRule)}`);
}

async function main() {
    const su = process.env.POCKETBASE_SUPERADMIN_EMAIL;
    const sp = process.env.POCKETBASE_SUPERADMIN_PASSWORD;
    if (!su || !sp) {
        console.error('Set POCKETBASE_SUPERADMIN_EMAIL and POCKETBASE_SUPERADMIN_PASSWORD in .env.local first.');
        process.exit(1);
    }
    await pb.admins.authWithPassword(su, sp);

    // payments: only service/admin may write; admin or owner may read (list already locked in 2a)
    await set('payments', { createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN, viewRule: ADMIN_OR_OWNER });

    // subscriptions: same. (create was self-service via user before; now done by service client.)
    await set('subscriptions', { createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN, viewRule: ADMIN_OR_OWNER });

    // businesses: lock UPDATE to admin/service (webhook now uses service). create stays self-service, delete already admin.
    await set('businesses', { updateRule: ADMIN });

    console.log('\nPhase 2b lock applied ✅');
}
main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
