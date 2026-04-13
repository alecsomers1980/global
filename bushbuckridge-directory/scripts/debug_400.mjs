import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugSchema() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        const collections = ['businesses', 'jobs', 'events', 'sectors', 'areas'];
        
        for (const name of collections) {
            try {
                const coll = await pb.collections.getOne(name);
                console.log(`\n--- Collection: ${coll.name} (ID: ${coll.id}) ---`);
                console.log('List Rule:', JSON.stringify(coll.listRule));
                console.log('View Rule:', JSON.stringify(coll.viewRule));
                
                // Fields might be in 'fields' or 'schema'
                const fields = coll.fields || coll.schema || [];
                console.log('Fields:');
                fields.forEach(f => {
                    console.log(`  - ${f.name} (${f.type})`);
                });
            } catch (err) {
                console.log(`❌ Error fetching ${name}:`, err.message);
            }
        }

    } catch (e) {
        console.error('Fatal Error:', e.response?.data || e.message);
    }
}

debugSchema();
