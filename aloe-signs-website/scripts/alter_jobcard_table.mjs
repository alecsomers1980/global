import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function alterTable() {
    console.log("Altering jobcards table to add new columns...");
    try {
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS deliver_car BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS delivery_address TEXT,
            ADD COLUMN IF NOT EXISTS installation_address TEXT,
            ADD COLUMN IF NOT EXISTS install_bakkie BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS install_truck BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS install_trailer BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS install_riggers VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_applicators VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_builders VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_minions VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_electrical VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_safety_file BOOLEAN DEFAULT false;
        `;
        console.log("Table altered successfully to include new columns.");
    } catch (e) {
        console.error("Error altering table:", e);
    }
}

alterTable();
