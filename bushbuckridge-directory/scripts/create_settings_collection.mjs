import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createSettingsCollection() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating with PocketBase...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);

        // Check if settings collection already exists
        const existing = await pb.collections.getList(1, 50);
        const settingsColl = existing.items.find(c => c.name === 'settings');

        if (settingsColl) {
            console.log('Settings collection already exists (id:', settingsColl.id, ')');
        } else {
            console.log('Creating settings collection...');
            await pb.collections.create({
                name: 'settings',
                type: 'base',
                fields: [
                    { name: 'key', type: 'text', required: true, unique: true },
                    { name: 'value', type: 'text', required: true },
                ],
                // Only PocketBase admins can read/write via the API
                listRule: null,
                viewRule: null,
                createRule: null,
                updateRule: null,
                deleteRule: null,
            });
            console.log('Settings collection created');
        }

        // Seed PayFast settings if not present
        const settingsCollId = settingsColl?.id || (await pb.collections.getList(1, 50)).items.find(c => c.name === 'settings')?.id;

        // Get existing settings records
        let existingSettings = [];
        try {
            const result = await pb.collection('settings').getList(1, 100);
            existingSettings = result.items;
        } catch (e) {
            // Collection might be new
        }

        const seedSettings = [
            { key: 'payfast_merchant_id', value: 'not_set' },
            { key: 'payfast_merchant_key', value: 'not_set' },
            { key: 'payfast_passphrase', value: 'not_set' },
            { key: 'payfast_test_mode', value: 'true' },
        ];

        for (const setting of seedSettings) {
            const exists = existingSettings.find(s => s.key === setting.key);
            if (!exists) {
                await pb.collection('settings').create(setting);
                console.log('Seeded setting:', setting.key);
            } else {
                console.log('Setting already exists:', setting.key, '(value length:', exists.value.length, ')');
            }
        }

        console.log('\nSettings collection ready. Current settings:');
        const all = await pb.collection('settings').getList(1, 100);
        for (const s of all.items) {
            const displayValue = s.value ? (s.value.length > 20 ? s.value.substring(0, 20) + '...' : s.value) : '(empty)';
            console.log(' ', s.key, '=', displayValue);
        }

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

createSettingsCollection();
