const { db } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = await db.connect();
  try {
    const { rows } = await client.sql`SELECT * FROM jobcards ORDER BY created_at DESC LIMIT 1`;
    console.log('SUCCESS:', rows.length, 'rows fetched');
    console.log(rows[0]);
  } catch (error) {
    console.error('SQL ERROR:', error.message);
  } finally {
    client.release();
  }
}
check();
