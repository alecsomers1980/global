import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function debugData() {
    try {
        await pb.admins.authWithPassword('alec@firewireit.co.za', 'Ph03n1x@135');
        const biz = await pb.collection('businesses').getFirstListItem('name = "Elite Property Development"');
        
        console.log('Keys for Elite Property Development:');
        console.log(Object.keys(biz).filter(k => !k.startsWith('_')).join(', '));
        
        console.log('\nValues:');
        console.log('Facebook:', biz.facebook);
        console.log('Instagram:', biz.instagram);
        console.log('LinkedIn:', biz.linkedin);
        console.log('Website:', biz.website);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

debugData();
