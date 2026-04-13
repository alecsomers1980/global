import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function addSpotlightCollections() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        console.log('\nCreating spotlight_articles collection...');

        const bizList = await pb.collections.getList(1, 1, { filter: 'name="businesses"' });
        const bizId = bizList.items.length > 0 ? bizList.items[0].id : null;

        if (!bizId) {
            console.error("Could not find businesses collection required for spotlight articles.");
            return;
        }

        try {
            await pb.collections.create({
                name: 'spotlight_articles',
                type: 'base',
                fields: [
                    { name: 'business_id', type: 'relation', collectionId: bizId, maxSelect: 1, cascadeDelete: true, required: true },
                    { name: 'status', type: 'select', values: ['pending', 'published'], required: true },
                    { name: 'layout', type: 'select', values: ['default', 'hero_top', 'gallery_grid'], required: true },
                    { name: 'content', type: 'editor' },
                    { name: 'images', type: 'file', options: { maxSelect: 10, maxSize: 5242880, protected: false } }
                ],
                listRule: '', 
                viewRule: '',
                createRule: null,
                updateRule: null,
                deleteRule: null
            });
            console.log('✅ Created spotlight_articles');
        } catch (e) {
            console.log('spotlight_articles might exist:', e.message);
            if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
        }

    } catch (e) {
        console.error('Fatal Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

addSpotlightCollections();
