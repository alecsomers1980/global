import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const ADMIN_EMAIL = 'alec@firewireit.co.za';
const ADMIN_PASSWORD = 'Ph03n1x@135';

async function main() {
  const pb = new PocketBase(PB_URL);

  try {
    console.log('Authenticating as admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authentication successful.');

    console.log('Fetching "businesses" collection...');
    const collection = await pb.collections.getOne('businesses');

    const newFields = [
      { name: 'facebook', type: 'text', required: false },
      { name: 'instagram', type: 'text', required: false },
      { name: 'linkedin', type: 'text', required: false },
      { name: 'website', type: 'text', required: false }
    ];

    const existingSchema = collection.schema || [];
    const existingFieldNames = new Set(existingSchema.map(f => f.name));

    const fieldsToAdd = newFields.filter(f => !existingFieldNames.has(f.name));

    if (fieldsToAdd.length === 0) {
      console.log('All fields already exist. No update needed.');
      return;
    }

    const updatedSchema = [...existingSchema, ...fieldsToAdd];

    console.log(`Adding ${fieldsToAdd.length} missing field(s) to "businesses"...`);
    await pb.collections.update(collection.id, { schema: updatedSchema });

    console.log('Success: Missing fields have been added to the "businesses" collection.');
  } catch (error) {
    console.error('Failure:', error.message);
    process.exit(1);
  }
}

main();
