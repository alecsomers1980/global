import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function check() {
  try {
    const { rows } = await sql`SELECT id, created_at, status, invoice FROM jobcards LIMIT 5`;
    console.log(rows);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
check();
