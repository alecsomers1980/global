// Import extracted enquiries JSON into Supabase
// Usage: node scripts/import-to-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://dlfotwhfjnxotkggwvow.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZm90d2hmam54b3RrZ2d3dm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTE3NiwiZXhwIjoyMDkzNTYxMTc2fQ.UgmdUrfqVs8xNk-0pcqHjwnIvbRmQqUNqg6aE7ibiz8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dataPath = join(__dirname, "enquiries-data.json");
console.log(`Reading ${dataPath}...`);

let enquiries = JSON.parse(readFileSync(dataPath, "utf-8"));

// Filter out placeholder/empty rows and clean data
enquiries = enquiries.filter((e) => {
  const name = (e.customer_name || "").trim();
  return name && name !== "–" && name !== "-" && name.length > 1;
});

// Clean follow_up_date values
enquiries = enquiries.map((e) => ({
  ...e,
  follow_up_date: (e.follow_up_date === "–" || e.follow_up_date === "-") ? null : e.follow_up_date,
}));

console.log(`Found ${enquiries.length} enquiries (filtered) to import\n`);

// Clear existing records first
console.log("Clearing existing enquiries...");
const { error: deleteError } = await supabase
  .from("enquiries")
  .delete()
  .neq("id", "00000000-0000-0000-0000-000000000000");
if (deleteError) {
  console.error("Failed to clear:", deleteError.message);
} else {
  console.log("Cleared.\n");
}

let success = 0;
let failed = 0;

for (const enquiry of enquiries) {
  const { error } = await supabase.from("enquiries").insert({
    customer_name: enquiry.customer_name,
    company: enquiry.company || null,
    phone: enquiry.phone || null,
    email: enquiry.email || null,
    enquiry_details: enquiry.enquiry_details || "",
    quote_value: enquiry.quote_value || 0,
    status: enquiry.status || "new",
    priority: enquiry.priority || "standard",
    follow_up_date: enquiry.follow_up_date || null,
    notes: enquiry.notes || null,
    created_at: enquiry.created_at || new Date().toISOString(),
  });

  if (error) {
    console.error(`✗ ${enquiry.customer_name}: ${error.message}`);
    failed++;
  } else {
    console.log(`✓ ${enquiry.customer_name}`);
    success++;
  }
}

console.log(`\n--- Import complete: ${success} success, ${failed} failed ---`);
