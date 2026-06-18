import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

    const biz = await pb.collections.getOne('businesses');
    console.log('=== businesses rules ===');
    console.log('listRule:', JSON.stringify(biz.listRule));
    console.log('viewRule:', JSON.stringify(biz.viewRule));
    console.log('createRule:', JSON.stringify(biz.createRule));
    console.log('updateRule:', JSON.stringify(biz.updateRule));
    console.log('deleteRule:', JSON.stringify(biz.deleteRule));

    // Find relations pointing to businesses
    const all = await pb.collections.getFullList();
    console.log('\n=== relations -> businesses ===');
    for (const c of all) {
        const fields = c.fields || c.schema || [];
        for (const f of fields) {
            if (f.type === 'relation' && f.collectionId === biz.id) {
                console.log(`${c.name}.${f.name}  cascadeDelete=${f.cascadeDelete ?? f.options?.cascadeDelete} required=${f.required}`);
            }
        }
    }
}

main().catch(e => console.error('ERR', e.message, e.data || ''));
