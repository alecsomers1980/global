import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function checkSchema() {
    try {
        await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');
        const c = await pb.collections.getOne('businesses');
        const fields = c.fields || c.schema;
        console.log('Business Fields:');
        fields.forEach(f => {
            if (f.name.match(/facebook|instagram|linkedin|website|whatsapp|social/i)) {
                console.log(`- ${f.name} (${f.type})`);
            }
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkSchema();
