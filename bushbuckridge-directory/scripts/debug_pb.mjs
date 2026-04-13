import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listAllCollections() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        const collections = await pb.collections.getFullList();
        console.log('Existing Collections:');
        collections.forEach(c => {
            console.log(`- Name: ${c.name}, ID: ${c.id}`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

listAllCollections();
