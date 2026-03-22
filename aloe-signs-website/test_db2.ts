import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function check() {
  try {
    const { rows } = await sql`SELECT * FROM jobcards ORDER BY created_at DESC LIMIT 1`;
    console.log("SUCCESS:", rows.length, "rows fetched");
  } catch (error) {
    console.error("SQL ERROR:", error);
  }
}
check();
