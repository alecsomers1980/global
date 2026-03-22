import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function alterTable() {
    try {
        console.log("Starting status_workflow_json addition...");
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS status_workflow_json JSONB DEFAULT '{}'::jsonb;
        `;
        console.log("Column added successfully");
    } catch (e) {
        console.error("DB Alter error:", e);
    }
}
alterTable();
