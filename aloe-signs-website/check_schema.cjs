const { db } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = await db.connect();
  try {
    const { rows } = await client.sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'jobcards';
    `;
    console.log(rows.map(r => r.column_name).join(', '));
  } catch (error) {
    console.error('SQL ERROR:', error.message);
  } finally {
    client.release();
  }
}
check();
