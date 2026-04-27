import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function alterTable() {
    console.log('Adding contact_phone_2 column to jobcards...');
    try {
        await sql`ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS contact_phone_2 TEXT;`;
        console.log('Done.');
    } catch (e) {
        console.error('Error altering table:', e);
        process.exit(1);
    }
}

alterTable();
