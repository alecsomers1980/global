import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const enquiries = await pb.collections.getOne('enquiries');
    const fields = (enquiries.fields || enquiries.schema).map(f => ({ ...f }));

    const typeField = fields.find(f => f.name === 'type');
    if (!typeField.values.includes('employer_services')) {
        typeField.values = [...typeField.values, 'employer_services'];
    }

    const statusField = fields.find(f => f.name === 'status');
    if (!statusField.values.includes('approved')) {
        statusField.values = [...statusField.values, 'approved'];
    }

    await pb.collections.update(enquiries.id, { fields });
    console.log('enquiries: type values ->', typeField.values.join(', '));
    console.log('enquiries: status values ->', statusField.values.join(', '));
}

main().catch(e => console.error('ERR', e.message, JSON.stringify(e.data || {})));
