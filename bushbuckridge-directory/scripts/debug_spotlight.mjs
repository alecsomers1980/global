import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

const c = await pb.collections.getOne('spotlight_articles');
console.log('Fields:', JSON.stringify(c.fields || c.schema, null, 2));

// Test different sort options
for (const sortOpt of ['-created', '-updated', '+id', '-id']) {
    try {
        await pb.collection('spotlight_articles').getList(1, 1, { sort: sortOpt });
        console.log(`Sort "${sortOpt}": OK`);
    } catch (e) {
        console.log(`Sort "${sortOpt}": FAIL (${e.status})`);
    }
}
