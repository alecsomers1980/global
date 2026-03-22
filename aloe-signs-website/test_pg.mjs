import { createClient } from "@vercel/postgres";
import * as dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env.local') });

async function check() {
  const client = createClient();
  await client.connect();
  try {
    const { rows } = await client.sql`SELECT * FROM jobcards ORDER BY created_at DESC LIMIT 1`;
    console.log("SUCCESS:", rows.length, "rows fetched");
    console.log(rows[0]);
  } catch (error) {
    console.error("SQL ERROR:", error);
  } finally {
    await client.end();
  }
}
check();
