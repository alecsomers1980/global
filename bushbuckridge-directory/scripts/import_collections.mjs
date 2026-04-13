import PocketBase from 'pocketbase';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function importCollections() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    // Superuser credentials provided by user
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating as Superuser...');
        const authData = await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('✅ Auth successful.');

        // Read the fixed schema file
        const schemaPath = 'C:/Users/info/OneDrive/Documents/Antigravity/bushbuckridge-directory/scripts/bushbuckridge_collections_fixed.json';
        const collections = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

        console.log(`Importing ${collections.length} collections...`);
        
        // In SDK 0.20+, use pb.collections.import()
        await pb.collections.import(collections, true);
        
        console.log('✅ Collections imported successfully.');
        
        // Verify
        const result = await pb.collections.getList(1, 20);
        console.log('Total collections on server:', result.totalItems);
        result.items.forEach(c => console.log(`- ${c.name}`));

    } catch (e) {
        console.error('❌ Error during import:', e.response?.data || e.message);
    }
}

importCollections();
