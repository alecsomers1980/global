import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function alterTable() {
    console.log("Altering jobcards table...");
    try {
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS items_json JSONB DEFAULT '[]'::jsonb;
        `;
        console.log("Table altered successfully to add items_json.");
    } catch (e) {
        console.error("Error altering table:", e);
    }
}

alterTable();
