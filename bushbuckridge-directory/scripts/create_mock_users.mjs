import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function createUsers() {
    try {
        // Admin user
        const adminData = {
            email: 'admin@dbib.co.za',
            emailVisibility: true,
            password: 'Password123!',
            passwordConfirm: 'Password123!',
            is_admin: true,
        };
        console.log('Creating admin user...');
        const adminDoc = await pb.collection('users').create(adminData);
        console.log('Admin user created:', adminData.email);

        // Client user
        const clientData = {
            email: 'client@domain.com',
            emailVisibility: true,
            password: 'Password123!',
            passwordConfirm: 'Password123!',
            is_admin: false,
        };
        console.log('Creating client user...');
        const clientDoc = await pb.collection('users').create(clientData);
        console.log('Client user created:', clientData.email);
        
    } catch (e) {
        console.error('Error creating users:', e.response || e.message);
    }
}

createUsers();
