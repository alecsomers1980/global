import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function finalCleanFix() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        const collectionsToDelete = [
            'businesses', 'jobs', 'events', 'sectors', 'areas', 
            'opportunities', 'enquiries', 'subscriptions'
        ];

        console.log('Cleaning up old corrupted collections...');
        for (const name of collectionsToDelete) {
            try {
                await pb.collections.delete(name);
                console.log(`- Deleted ${name}`);
            } catch (e) {}
        }

        console.log('\nCreating collections using NEW FLAT structure (PB v0.26+)...');

        // 1. Sectors
        const sectorColl = await pb.collections.create({
            name: 'sectors',
            type: 'base',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created sectors');

        // 2. Areas
        const areaColl = await pb.collections.create({
            name: 'areas',
            type: 'base',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created areas');

        // 3. Businesses (FLAT OPTIONS for PB v0.26)
        await pb.collections.create({
            name: 'businesses',
            type: 'base',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'sector', type: 'relation', collectionId: sectorColl.id, maxSelect: 1, cascadeDelete: false },
                { name: 'area', type: 'relation', collectionId: areaColl.id, maxSelect: 1, cascadeDelete: false },
                { name: 'phone', type: 'text' },
                { name: 'whatsapp', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'description', type: 'editor' },
                { name: 'status', type: 'select', values: ['pending', 'active', 'rejected'] },
                { name: 'package_tier', type: 'select', values: ['standard', 'enhanced', 'premium'] },
                { name: 'is_featured', type: 'bool' },
                { name: 'is_verified', type: 'bool' },
                { name: 'logo', type: 'file', maxSelect: 1 }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created businesses');

        // Jobs
        await pb.collections.create({
            name: 'jobs',
            type: 'base',
            fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'description', type: 'editor' }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created jobs');

        // Events
        await pb.collections.create({
            name: 'events',
            type: 'base',
            fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'date', type: 'date' }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created events');

        console.log('\n--- Final Verification ---');
        const bizList = await pb.collections.getList(1, 20);
        const biz = bizList.items.find(c => c.name === 'businesses');
        console.log('Businesses fields:', biz.fields.map(f => f.name).join(', '));

    } catch (e) {
        console.error('Fatal Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

finalCleanFix();
