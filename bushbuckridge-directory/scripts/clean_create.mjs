import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function cleanCreate() {
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

        console.log('Cleaning up old empty collections...');
        for (const name of collectionsToDelete) {
            try {
                // Try deleting by name/id
                await pb.collections.delete(name);
                console.log(`- Deleted ${name}`);
            } catch (e) {
                // Ignore if not found
            }
        }

        console.log('\nCreating collections from scratch...');

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

        // 3. Businesses
        await pb.collections.create({
            name: 'businesses',
            type: 'base',
            fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'sector', type: 'relation', options: { collectionId: sectorColl.id, maxSelect: 1 } },
                { name: 'area', type: 'relation', options: { collectionId: areaColl.id, maxSelect: 1 } },
                { name: 'phone', type: 'text' },
                { name: 'whatsapp', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'description', type: 'editor' },
                { name: 'status', type: 'select', options: { values: ['pending', 'active', 'rejected'] } },
                { name: 'package_tier', type: 'select', options: { values: ['standard', 'enhanced', 'premium'] } },
                { name: 'is_featured', type: 'bool' },
                { name: 'is_verified', type: 'bool' },
                { name: 'logo', type: 'file', options: { maxSelect: 1 } }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created businesses');

        // 4. Jobs
        await pb.collections.create({
            name: 'jobs',
            type: 'base',
            fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'description', type: 'editor' },
                { name: 'status', type: 'select', options: { values: ['active', 'filled', 'expired'] } }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created jobs');

        // 5. Events
        await pb.collections.create({
            name: 'events',
            type: 'base',
            fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
                { name: 'date', type: 'date' },
                { name: 'venue', type: 'text' },
                { name: 'status', type: 'select', options: { values: ['upcoming', 'ongoing', 'past', 'cancelled'] } }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created events');

        // Update Users (custom fields)
        const userColl = await pb.collections.getOne('users');
        const userFields = [...userColl.fields];
        if (!userFields.find(f => f.name === 'is_admin')) {
            userFields.push({ name: 'is_admin', type: 'bool' });
        }
        await pb.collections.update('users', { fields: userFields });
        console.log('✅ Updated users schema');

        console.log('\n--- Final Verification ---');
        const biz = await pb.collections.getOne('businesses');
        console.log('Businesses fields:', biz.fields.map(f => f.name).join(', '));

    } catch (e) {
        console.error('Fatal Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

cleanCreate();
