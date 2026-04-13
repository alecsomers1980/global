import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function updateSocials() {
    try {
        console.log('Authenticating as admin...');
        await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');

        const targets = [
            {
                name: 'Elite Property Development',
                updates: {
                    facebook: 'https://facebook.com/eliteproperty',
                    instagram: 'https://instagram.com/eliteproperty',
                    linkedin: 'https://linkedin.com/company/eliteproperty',
                    website: 'https://eliteproperty.local'
                }
            },
            {
                name: 'Apex Financial Solutions',
                updates: {
                    facebook: 'https://facebook.com/apexfinance',
                    instagram: 'https://instagram.com/apexfinance',
                    website: 'https://apexfinance.local'
                }
            }
        ];

        for (const target of targets) {
            console.log(`\nSearching for "${target.name}"...`);
            try {
                const biz = await pb.collection('businesses').getFirstListItem(`name = "${target.name}"`);
                console.log(`Found ID: ${biz.id}. Updating social links...`);
                
                await pb.collection('businesses').update(biz.id, target.updates);
                console.log(`✅ Success for ${target.name}`);
            } catch (e) {
                console.error(`❌ Could not find or update "${target.name}": ${e.message}`);
            }
        }

        console.log('\nAll updates complete!');
    } catch (e) {
        console.error('Fatal Error:', e.message);
    }
}

updateSocials();
