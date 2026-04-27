const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
  try {
    console.log('Adding materials_other_text to jobcards...');
    await sql`ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS materials_other_text TEXT`;
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
