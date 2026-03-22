const { sql } = require("@vercel/postgres");
require("dotenv").config({ path: ".env.local" });

async function alterTable() {
    try {
        console.log("Starting column addition...");
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS deliver_bakkie BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS deliver_truck BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS deliver_trailer BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS install_generator BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS install_welder BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS install_shovels BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS install_additional TEXT,
            ADD COLUMN IF NOT EXISTS track_collect BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS compiled_by TEXT,
            ADD COLUMN IF NOT EXISTS materials_json JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS files_json JSONB DEFAULT '[]'::jsonb;
        `;
        console.log("Columns added successfully");
    } catch (e) {
        console.error(e);
    }
}
alterTable();
