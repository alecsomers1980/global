import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function alterTable() {
    try {
        console.log("Starting column addition for engineer_details_json...");
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS engineer_details_json JSONB DEFAULT '{}'::jsonb;
        `;
        console.log("Column engineer_details_json added successfully");
    } catch (e) {
        console.error(e);
    }
}
alterTable();
