const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
  try {
    console.log('Adding flatbed_details_json to jobcards...');
    await sql`ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS flatbed_details_json JSONB`;
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
