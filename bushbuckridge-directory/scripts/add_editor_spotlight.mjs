import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function addEditorSpotlightCollection() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        console.log('\nCreating editor_spotlight collection...');

        try {
            await pb.collections.create({
                name: 'editor_spotlight',
                type: 'base',
                fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'title', type: 'text', required: true },
                    { name: 'short_description', type: 'text', required: true },
                    { name: 'full_description', type: 'editor' },
                    { name: 'image', type: 'file', options: { maxSelect: 1, maxSize: 5242880, protected: false } },
                    { name: 'is_active', type: 'bool' }
                ],
                listRule: '', 
                viewRule: '',
                createRule: null,
                updateRule: null,
                deleteRule: null
            });
            console.log('✅ Created editor_spotlight');
        } catch (e) {
            console.log('editor_spotlight might exist:', e.message);
            if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
        }

    } catch (e) {
        console.error('Fatal Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

addEditorSpotlightCollection();
