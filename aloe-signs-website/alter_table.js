require('dotenv').config({path: '.env.local'});
const { sql } = require('@vercel/postgres');

async function run() {
    try {
        const res = await sql`ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS screen_details_json JSONB;`;
        console.log('Success:', res);
    } catch (e) {
        console.error(e);
    }
}
run();
