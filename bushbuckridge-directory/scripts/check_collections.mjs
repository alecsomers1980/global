import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function checkCollections() {
    try {
        console.log('Checking collections for:', process.env.NEXT_PUBLIC_POCKETBASE_URL);
        
        const collections = ['businesses', 'jobs', 'events', 'sectors', 'areas'];
        
        for (const name of collections) {
            try {
                const res = await pb.collection(name).getList(1, 1);
                console.log(`✅ Collection "${name}" exists (Count: ${res.totalItems})`);
            } catch (e) {
                console.log(`❌ Collection "${name}" error:`, e.message);
            }
        }
    } catch (e) {
        console.error('Error checking collections:', e.message);
    }
}

checkCollections();
