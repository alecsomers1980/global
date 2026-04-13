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

        console.log('Cleaning up old collections...');
        for (const name of collectionsToDelete) {
            try {
                await pb.collections.delete(name);
                console.log(`- Deleted ${name}`);
            } catch (e) {}
        }

        console.log('\nCreating collections using raw API...');

        // Helper to create a collection via raw send
        async function createCollection(data) {
            return await pb.send('/api/collections', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Sectors
        const sectorColl = await createCollection({
            name: 'sectors',
            type: 'base',
            fields: [
                { id: 'sectors_name_f', name: 'name', type: 'text', required: true },
                { id: 'sectors_slug_f', name: 'slug', type: 'text', required: true }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created sectors');

        // 2. Areas
        const areaColl = await createCollection({
            name: 'areas',
            type: 'base',
            fields: [
                { id: 'areas_name_fld', name: 'name', type: 'text', required: true },
                { id: 'areas_slug_fld', name: 'slug', type: 'text', required: true }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created areas');

        // 3. Businesses
        await createCollection({
            name: 'businesses',
            type: 'base',
            fields: [
                { id: 'biz_name_field', name: 'name', type: 'text', required: true },
                { id: 'biz_sector_fld', name: 'sector', type: 'relation', options: { collectionId: sectorColl.id, maxSelect: 1 } },
                { id: 'biz_area_field', name: 'area', type: 'relation', options: { collectionId: areaColl.id, maxSelect: 1 } },
                { id: 'biz_phone_fiel', name: 'phone', type: 'text' },
                { id: 'biz_whatsapp_f', name: 'whatsapp', type: 'text' },
                { id: 'biz_email_fiel', name: 'email', type: 'email' },
                { id: 'biz_desc_field', name: 'description', type: 'editor' },
                { id: 'biz_status_fld', name: 'status', type: 'select', options: { values: ['pending', 'active', 'rejected'] } },
                { id: 'biz_tier_field', name: 'package_tier', type: 'select', options: { values: ['standard', 'enhanced', 'premium'] } },
                { id: 'biz_feat_field', name: 'is_featured', type: 'bool' },
                { id: 'biz_verified_f', name: 'is_verified', type: 'bool' },
                { id: 'biz_logo_field', name: 'logo', type: 'file', options: { maxSelect: 1 } }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created businesses');

        // Jobs
        await createCollection({
            name: 'jobs',
            type: 'base',
            fields: [
                { id: 'jobs_title_fld', name: 'title', type: 'text', required: true },
                { id: 'jobs_slug_fild', name: 'slug', type: 'text', required: true },
                { id: 'jobs_desc_fild', name: 'description', type: 'editor' }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created jobs');

        // Events
        await createCollection({
            name: 'events',
            type: 'base',
            fields: [
                { id: 'evts_title_fld', name: 'title', type: 'text', required: true },
                { id: 'evts_slug_fild', name: 'slug', type: 'text', required: true },
                { id: 'evts_date_fild', name: 'date', type: 'date' }
            ],
            listRule: '', viewRule: ''
        });
        console.log('✅ Created events');

        console.log('\n--- Final Verification ---');
        const bizList = await pb.collections.getList(1, 20);
        console.log('Collections successfully created:', bizList.items.map(c => c.name).join(', '));

    } catch (e) {
        console.error('Fatal Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

cleanCreate();
