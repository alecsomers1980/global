// Applies migration/seed SQL files against DATABASE_URL.
// Usage: node scripts/apply-sql.mjs <file.sql> [more.sql ...]
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/apply-sql.mjs <file.sql> [more.sql ...]");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

let client;
let exitCode = 0;

try {
  client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  for (const file of files) {
    const basename = path.basename(file);
    try {
      const sql = fs.readFileSync(file, "utf8");
      await client.query(sql);
      console.log(`applied ${basename}`);
    } catch (error) {
      console.error(`failed ${basename}: ${error.message}`);
      exitCode = 1;
      break;
    }
  }
} catch (error) {
  console.error("failed to connect to database");
  exitCode = 1;
} finally {
  if (client) {
    await client.end().catch(() => {});
  }
}

process.exitCode = exitCode;

