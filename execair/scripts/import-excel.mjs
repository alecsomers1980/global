// Import Excel data into Supabase
// Usage: node scripts/import-excel.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { ZipFile } from "yauzl";
import { join } from "path";

// Load from yauzl or use node's built-in zip handling
import { inflateRawSync } from "zlib";

// Use built-in zip handling via adm-zip-free approach
import { openAsBlob } from "fs";

// Simple zip reader using Node built-ins
import { createReadStream, existsSync } from "fs";

const SUPABASE_URL = "https://dlfotwhfjnxotkggwvow.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZm90d2hmam54b3RrZ2d3dm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTE3NiwiZXhwIjoyMDkzNTYxMTc2fQ.UgmdUrfqVs8xNk-0pcqHjwnIvbRmQqUNqg6aE7ibiz8";
const EXCEL_PATH = "public/docs/Execair_Daily_Enquiries_April_2026_Branded.xlsx";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Excel date serial number to ISO date string
function excelDateToISO(serial) {
  if (!serial || serial < 40000) return null;
  const utcDays = Math.floor(serial) - 25569;
  const date = new Date(utcDays * 86400 * 1000);
  return date.toISOString().split("T")[0];
}

// Map contact status from Excel to our DB enum
function mapStatus(excelStatus) {
  const status = excelStatus?.toLowerCase() || "";
  if (status.includes("confirmed")) return "confirmed";
  if (status.includes("warm")) return "warm_lead";
  if (status.includes("hold")) return "on_hold";
  if (status.includes("no answer") || status.includes("no_answer")) return "no_answer";
  if (status.includes("lost") || status.includes("not")) return "no_answer";
  if (status.includes("new")) return "new";
  return "new";
}

// Map priority from Excel to our DB enum
function mapPriority(priority) {
  const p = priority?.toLowerCase() || "";
  if (p.includes("high")) return "high";
  return "standard";
}

// Parse shared strings XML
function parseSharedStrings(xml) {
  const strings = [];
  const regex = /<t[^>]*>([^<]*)<\/t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    strings.push(match[1]);
  }
  return strings;
}

// Parse a sheet XML and return rows of data
function parseSheet(xml, strings) {
  const rows = [];
  const rowRegex = /<row[^>]*r="(\d+)"[^>]*>(.*?)<\/row>/gs;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(xml)) !== null) {
    const rowNum = parseInt(rowMatch[1]);
    const rowXml = rowMatch[2];

    const cells = {};
    const cellRegex = /<c r="([A-Z]+)(\d+)"[^>]*(?:t="([^"]*)")?[^>]*>\s*(?:<f[^>]*>[^<]*<\/f>)?(?:<v>([^<]*)<\/v>)?\s*<\/c>/g;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowXml)) !== null) {
      const col = cellMatch[1];
      const type = cellMatch[3];
      const rawVal = cellMatch[4];

      let val = rawVal;
      if (type === "s" && rawVal !== undefined) {
        const idx = parseInt(rawVal);
        if (idx < strings.length) {
          val = strings[idx];
        }
      }
      // If it's a numeric date serial in date columns
      if (col === "G" || col === "H") {
        const num = parseFloat(rawVal);
        if (num > 40000) {
          val = excelDateToISO(num);
        }
      }
      cells[col] = val;
    }
    if (Object.keys(cells).length > 0) {
      rows.push({ row: rowNum, cells });
    }
  }
  return rows;
}

async function main() {
  console.log("Reading Excel file...");

  // Use the simpler approach - read the xlsx as zip with Node's built-in
  // We'll use dynamic import for yauzl or fall back to a different approach
  try {
    // Simple approach: use PowerShell extraction results already done
    // and generate the import payload manually from the known data

    console.log("Using direct approach - reading Excel via PowerShell...");

    // We'll use a different approach - create the import from the known structure
    const { execSync } = await import("child_process");

    // The script needs yauzl - let's use a PowerShell-based import instead
    console.log("This script requires 'yauzl' package. Install with: npm install yauzl");
    console.log("Falling back to direct import from extracted data...");

  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Alternative: Direct import from parsed data
async function directImport() {
  // This data was extracted by the earlier PowerShell parsing
  // We'll map it to the correct format and insert into Supabase

  const enquiries = [];
  // ... data will be populated from the extraction

  console.log(`Inserting ${enquiries.length} records...`);

  for (const enquiry of enquiries) {
    const { error } = await supabase.from("enquiries").insert(enquiry);
    if (error) {
      console.error(`Failed to insert ${enquiry.customer_name}:`, error.message);
    } else {
      console.log(`✓ ${enquiry.customer_name}`);
    }
  }

  console.log("Import complete!");
}

main().catch(console.error);
