import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function fullSchema() {
    try {
        await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');
        const c = await pb.collections.getOne('businesses');
        console.log('Full Business Fields:');
        const fields = c.fields || c.schema;
        fields.forEach(f => console.log(`- ${f.name} (${f.type})`));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

fullSchema();
