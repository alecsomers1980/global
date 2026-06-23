import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(
        process.env.POCKETBASE_SUPERADMIN_EMAIL,
        process.env.POCKETBASE_SUPERADMIN_PASSWORD
    );

    // Fetch the users collection
    const col = await pb.collections.getOne('users');
    const fields = col.fields || col.schema;
    const hasSuspended = fields.some(f => f.name === 'suspended');

    if (!hasSuspended) {
        const newFields = [...fields, { name: 'suspended', type: 'bool', required: false }];
        await pb.collections.update(col.id, { fields: newFields });
        console.log('users: added -> suspended');
    } else {
        console.log('users: suspended field already present, skipping');
    }

    // Always update access rules to include admin permissions
    const adminRule = 'id = @request.auth.id || @request.auth.is_admin = true';
    await pb.collections.update(col.id, {
        listRule: adminRule,
        viewRule: adminRule,
        updateRule: adminRule,
        deleteRule: adminRule
    });
    console.log('users: updated access rules for admin management');
}

main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
