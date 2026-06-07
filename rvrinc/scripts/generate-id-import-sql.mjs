// Reads Excel and outputs SQL UPDATE statements to populate id_number on cases
// Usage: node scripts/generate-id-import-sql.mjs > import-id-numbers.sql
// Then run the SQL in Supabase SQL Editor

import XLSX from "xlsx";
import { readFileSync } from "fs";

const EXCEL_PATH = process.argv[2] || "C:\\Users\\info\\Downloads\\2025.11.18 FILES UPDATE - VERY IMPORTANT.xlsx";

// Values that are NOT actual ID/passport numbers (they're statuses or markers)
const NON_ID_VALUES = new Set([
    "FINALIZED", "COSTS ONLY", "ABANDONED", "", "N/A", "-",
    "FINALISED", "CLOSED", "CLOSED FILE",
]);

function isActualIdNumber(value) {
    if (!value || NON_ID_VALUES.has(value.toUpperCase().trim())) return false;
    const cleaned = value.trim();
    return cleaned.length >= 4;
}

function escapeSql(str) {
    return str.replace(/'/g, "''").trim();
}

function normalizeName(name) {
    return name.trim().toUpperCase().replace(/\s+/g, " ");
}

function nameToSqlCondition(name) {
    const escaped = escapeSql(name.trim());
    // Try exact match on full_name
    return `LOWER(TRIM(p.full_name)) = LOWER(TRIM('${escaped}'))`;
}

console.log("-- Generated from: " + EXCEL_PATH);
console.log("-- Run this in Supabase SQL Editor to populate id_number on cases");
console.log("-- NOTE: Review before running. May need adjustment for unmatched names.\n");

console.log("BEGIN;\n");

const buf = readFileSync(EXCEL_PATH);
const wb = XLSX.read(buf, { type: "buffer" });
const sheet = wb.Sheets["Sheet1"];

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
const dataRows = rows.slice(3).filter(row => row[0] && row[1]);

let updateCount = 0;
let skipCount = 0;
const skipped = [];

for (const row of dataRows) {
    const ref = row[0]?.toString().trim();
    const clientName = row[1]?.toString().trim();
    const idNumber = row[3]?.toString().trim();

    if (!ref || !clientName) continue;
    if (!isActualIdNumber(idNumber)) {
        skipped.push(`-- SKIPPED: ${ref} | ${clientName} (non-ID value: "${idNumber}")`);
        skipCount++;
        continue;
    }

    const escapedId = escapeSql(idNumber);
    const escapedName = escapeSql(clientName);

    // Update cases where the client's full_name matches
    console.log(`-- ${ref} | ${clientName} | ${idNumber}`);
    console.log(`UPDATE cases c`);
    console.log(`SET id_number = '${escapedId}'`);
    console.log(`FROM profiles p`);
    console.log(`WHERE c.client_id = p.id`);
    console.log(`  AND ${nameToSqlCondition(clientName)}`);
    console.log(`  AND c.id_number IS NULL;`);
    console.log("");
    updateCount++;
}

console.log("\n-- ========================================");
console.log(`-- Generated: ${updateCount} UPDATE statements`);
console.log(`-- Skipped: ${skipCount} rows (non-ID values in ID column)`);
console.log("-- ========================================");

if (skipped.length > 0) {
    console.log("\n-- SKIPPED ROWS (no valid ID number):");
    skipped.forEach(s => console.log(s));
}

console.log("\nCOMMIT;");
