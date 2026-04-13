import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixCollectionsForAdmin() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating as Superuser...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);

        console.log('Fetching businesses ID for relation...');
        const bizRes = await pb.collections.getList(1, 1, { filter: 'name="businesses"' });
        const bizId = bizRes.items[0]?.id;

        // 1. Create missing 'payments' collection
        try {
            console.log('Creating payments collection...');
            await pb.collections.create({
                name: 'payments',
                type: 'base',
                fields: [
                    { name: 'business', type: 'relation', collectionId: bizId, maxSelect: 1, cascadeDelete: false },
                    { name: 'amount', type: 'number' },
                    { name: 'status', type: 'select', values: ['pending', 'completed', 'failed'] },
                    { name: 'reference', type: 'text' },
                    { name: 'plan_tier', type: 'select', values: ['standard', 'enhanced', 'premium'] }
                ],
                listRule: '', viewRule: '', createRule: ''
            });
            console.log('✅ Created payments collection');
        } catch (e) {
            console.log('Payments might exist or error:', e.message);
        }

        // 2. Update all collections to have listRule: '' and viewRule: '' instead of null
        const collectionNames = ['enquiries', 'subscriptions', 'payments', 'opportunities', 'businesses', 'events', 'jobs', 'areas', 'sectors'];
        
        for (const name of collectionNames) {
            try {
                const collArray = await pb.collections.getList(1, 1, { filter: `name="${name}"` });
                if (collArray.items.length > 0) {
                    const coll = collArray.items[0];
                    if (coll.listRule === null || coll.viewRule === null) {
                        await pb.collections.update(coll.id, {
                            listRule: '',
                            viewRule: ''
                        });
                        console.log(`✅ Updated rules for ${name}`);
                    }
                }
            } catch (e) {
                console.log(`Failed to update ${name}:`, e.message);
            }
        }

        console.log('Done fixing schema!');
    } catch (e) {
        console.error('Fatal Error:', e.message);
    }
}

fixCollectionsForAdmin();
