import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const r = (v) => v === null ? 'NULL(admin)' : v === '' ? '""(open)' : JSON.stringify(v);

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');
    const cols = await pb.collections.getFullList();
    for (const c of cols) {
        if (c.system) continue;
        console.log(`\n## ${c.name} (type=${c.type})`);
        console.log(`  list   ${r(c.listRule)}`);
        console.log(`  view   ${r(c.viewRule)}`);
        console.log(`  create ${r(c.createRule)}`);
        console.log(`  update ${r(c.updateRule)}`);
        console.log(`  delete ${r(c.deleteRule)}`);
        const hasCreated = (c.fields || c.schema || []).some(f => f.name === 'created');
        if (c.name === 'payments') console.log(`  [payments has 'created' field? ${hasCreated}]`);
    }
}
main().catch(e => console.error('ERR', e.message));
