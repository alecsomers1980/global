import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function checkSocials() {
    try {
        await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');
        const bizzes = await pb.collection('businesses').getFullList({
            filter: 'package_tier = "premium"'
        });

        console.log(`Found ${bizzes.length} premium businesses:`);
        bizzes.forEach(b => {
            console.log(`\n- ${b.name}:`);
            console.log(`  Facebook: ${b.facebook || 'NONE'}`);
            console.log(`  Instagram: ${b.instagram || 'NONE'}`);
            console.log(`  LinkedIn: ${b.linkedin || 'NONE'}`);
            console.log(`  WhatsApp: ${b.whatsapp || 'NONE'}`);
            console.log(`  Website: ${b.website || 'NONE'}`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkSocials();
