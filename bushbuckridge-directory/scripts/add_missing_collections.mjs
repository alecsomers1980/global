import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function addMissingCollections() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        console.log('\nCreating missing collections using FLAT structure (PB v0.26+)...');

        // Opportunities
        try {
            await pb.collections.create({
                name: 'opportunities',
                type: 'base',
                fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'category', type: 'select', values: ['Funding', 'Tenders', 'Training', 'Business Support'] },
                    { name: 'deadline', type: 'date' },
                    { name: 'contact_info', type: 'editor' },
                    { name: 'attachment', type: 'file', maxSelect: 1 }
                ],
                listRule: '', viewRule: ''
            });
            console.log('✅ Created opportunities');
        } catch (e) {
            console.log('Opportunities might exist:', e.message);
        }

        // Enquiries
        try {
            await pb.collections.create({
                name: 'enquiries',
                type: 'base',
                fields: [
                    { name: 'type', type: 'select', values: ['buy_spot', 'general'] },
                    { name: 'business_name', type: 'text' },
                    { name: 'contact_person', type: 'text' },
                    { name: 'phone', type: 'text' },
                    { name: 'email', type: 'email' },
                    { name: 'details', type: 'editor' },
                    { name: 'status', type: 'select', values: ['new', 'contacted', 'resolved'] }
                ],
                listRule: null, viewRule: null, createRule: ""
            });
            console.log('✅ Created enquiries');
        } catch (e) {
            console.log('Enquiries might exist:', e.message);
        }

        // Subscriptions
        const bizList = await pb.collections.getList(1, 1, { filter: 'name="businesses"' });
        const bizId = bizList.items.length > 0 ? bizList.items[0].id : null;

        try {
            if (bizId) {
                await pb.collections.create({
                    name: 'subscriptions',
                    type: 'base',
                    fields: [
                        { name: 'business', type: 'relation', collectionId: bizId, maxSelect: 1, cascadeDelete: false },
                        { name: 'tier', type: 'select', values: ['standard', 'enhanced', 'premium'] },
                        { name: 'status', type: 'select', values: ['active', 'expired', 'cancelled'] },
                        { name: 'expires_at', type: 'date' }
                    ],
                    listRule: '', viewRule: ''
                });
                console.log('✅ Created subscriptions');
            } else {
                console.log('Could not find businesses collection to link subscriptions to.');
            }
        } catch (e) {
            console.log('Subscriptions might exist:', e.message);
        }

        console.log('\n--- Final Verification ---');
        const colls = await pb.collections.getList(1, 20);
        console.log('Current Collections:', colls.items.map(c => c.name).join(', '));

    } catch (e) {
        console.error('Fatal Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

addMissingCollections();
