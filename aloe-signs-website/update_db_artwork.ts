import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function alterTable() {
    try {
        console.log("Starting column addition for artwork...");
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS prod_artwork BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS artwork_details_json JSONB DEFAULT '{}'::jsonb;
        `;
        console.log("Columns added successfully");
    } catch (e) {
        console.error(e);
    }
}
alterTable();
