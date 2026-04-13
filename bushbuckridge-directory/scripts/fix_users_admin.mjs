import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixUsersAdmin() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const adminEmail = 'alec@firewireit.co.za';
    const adminPassword = 'Ph03n1x@135';

    try {
        console.log('Authenticating...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        
        // Find businesses ID
        const cols = await pb.collections.getList(1, 1, { filter: 'name="businesses"' });
        const bizId = cols.items[0].id;
        
        console.log('Fetching users collection...');
        const usersColl = await pb.collections.getOne('users');
        const fields = [...usersColl.fields];
        
        let updated = false;
        if (!fields.find(f => f.name === 'is_admin')) {
            fields.push({ name: 'is_admin', type: 'bool' });
            updated = true;
        }
        if (!fields.find(f => f.name === 'business_id')) {
            fields.push({ name: 'business_id', type: 'relation', collectionId: bizId, maxSelect: 1, cascadeDelete: false });
            updated = true;
        }
        
        if (updated) {
            console.log('Updating users collection schema...');
            await pb.collections.update('users', { fields });
            console.log('✅ Users schema updated.');
        } else {
            console.log('Users schema already has is_admin.');
        }

        // 2. Make admin@dbib.co.za an admin
        const usersRecord = await pb.collection('users').getList(1, 1, { filter: 'email = "admin@dbib.co.za"' });
        if (usersRecord.items.length > 0) {
            const adminUser = usersRecord.items[0];
            await pb.collection('users').update(adminUser.id, { is_admin: true });
            console.log('✅ Set is_admin = true for admin@dbib.co.za');
        } else {
            console.log('Could not find user admin@dbib.co.za');
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

fixUsersAdmin();
