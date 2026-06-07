// Import script: reads Excel file and populates id_number on cases table
// Usage: node scripts/import-id-numbers.mjs <path-to-excel.xlsx>
// Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars

import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import { readFileSync } from "fs";

const EXCEL_PATH = process.argv[2] || "C:\\Users\\info\\Downloads\\2025.11.18 FILES UPDATE - VERY IMPORTANT.xlsx";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERROR: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Values in the ID column that are NOT actual ID numbers
const NON_ID_VALUES = new Set([
    "FINALIZED", "COSTS ONLY", "ABANDONED", "", "N/A",
    "FINALISED", "CLOSED", "CLOSED FILE"
]);

function isActualIdNumber(value) {
    if (!value || NON_ID_VALUES.has(value.toUpperCase().trim())) return false;
    const cleaned = value.trim();
    // Must have at least 4 characters/digits
    if (cleaned.length < 4) return false;
    return true;
}

function normalizeName(name) {
    return name.trim().toUpperCase().replace(/\s+/g, " ");
}

async function main() {
    console.log(`Reading Excel file: ${EXCEL_PATH}`);
    const buf = readFileSync(EXCEL_PATH);
    const wb = XLSX.read(buf, { type: "buffer" });

    // Use Sheet1 which has the case data
    const sheet = wb.Sheets["Sheet1"];
    if (!sheet) {
        console.error("Sheet1 not found in workbook. Available sheets:", Object.keys(wb.Sheets));
        process.exit(1);
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Total rows in sheet: ${rows.length}`);

    // Headers are in row 1 (0-indexed row 1)
    // Row 2 (index 3) starts the data
    const dataRows = rows.slice(3).filter(row => row[0] && row[1]); // Has REF and CLIENT name

    // Extract valid entries: [ref, clientName, idNumber]
    const entries = [];
    for (const row of dataRows) {
        const ref = row[0]?.toString().trim();
        const clientName = row[1]?.toString().trim();
        const idNumber = row[3]?.toString().trim();

        if (!ref || !clientName) continue;
        if (!isActualIdNumber(idNumber)) continue;

        entries.push({ ref, clientName, idNumber });
    }

    console.log(`Entries with valid ID numbers: ${entries.length}`);

    // Fetch all profiles for name matching
    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name");

    if (profileError) {
        console.error("Failed to fetch profiles:", profileError.message);
        process.exit(1);
    }

    console.log(`Profiles in database: ${profiles.length}`);

    // Fetch all cases with their client info
    const { data: cases, error: caseError } = await supabase
        .from("cases")
        .select("id, case_number, title, client_id, id_number, client:profiles!client_id(full_name)");

    if (caseError) {
        console.error("Failed to fetch cases:", caseError.message);
        process.exit(1);
    }

    console.log(`Cases in database: ${cases.length}`);

    // Build lookup: normalized name → profile id
    const profileByName = new Map();
    for (const p of profiles) {
        if (p.full_name) {
            profileByName.set(normalizeName(p.full_name), p.id);
        }
    }

    let matched = 0;
    let updated = 0;
    let skipped = 0;
    const unmatchedNames = [];

    for (const entry of entries) {
        const normName = normalizeName(entry.clientName);

        // Try exact match first
        let profileId = profileByName.get(normName);

        // Try fuzzy: check if any profile name contains the client name or vice versa
        if (!profileId) {
            for (const [name, id] of profileByName) {
                if (name.includes(normName) || normName.includes(name)) {
                    profileId = id;
                    break;
                }
            }
        }

        // Try matching just last name
        if (!profileId) {
            const parts = normName.split(" ");
            const lastName = parts[parts.length - 1];
            if (lastName.length > 2) {
                for (const [name, id] of profileByName) {
                    if (name.includes(lastName)) {
                        profileId = id;
                        break;
                    }
                }
            }
        }

        if (!profileId) {
            unmatchedNames.push(`${entry.ref} | ${entry.clientName}`);
            skipped++;
            continue;
        }

        matched++;

        // Find cases for this client
        const clientCases = cases.filter(c => c.client_id === profileId && !c.id_number);

        if (clientCases.length > 0) {
            for (const c of clientCases) {
                const { error: updateError } = await supabase
                    .from("cases")
                    .update({ id_number: entry.idNumber })
                    .eq("id", c.id);

                if (updateError) {
                    console.error(`  FAILED to update case ${c.case_number}: ${updateError.message}`);
                } else {
                    console.log(`  UPDATED case ${c.case_number} (${entry.clientName}) with ID ${entry.idNumber}`);
                    updated++;
                }
            }
        } else {
            // Case exists but already has id_number, or no cases found
            const existingCases = cases.filter(c => c.client_id === profileId);
            if (existingCases.every(c => c.id_number)) {
                skipped++;
            } else {
                console.log(`  NO CASE for ${entry.clientName} (ref: ${entry.ref}) - client has no cases without id_number`);
                skipped++;
            }
        }
    }

    console.log("\n=== IMPORT SUMMARY ===");
    console.log(`Total Excel entries with valid IDs: ${entries.length}`);
    console.log(`Matched to profiles: ${matched}`);
    console.log(`Cases updated: ${updated}`);
    console.log(`Skipped (no match / already set): ${skipped}`);
    console.log(`Unmatched names: ${unmatchedNames.length}`);
    if (unmatchedNames.length > 0 && unmatchedNames.length <= 30) {
        console.log("\nUnmatched entries (need manual review):");
        unmatchedNames.forEach(n => console.log(`  ${n}`));
    } else if (unmatchedNames.length > 30) {
        console.log(`\n(First 30 of ${unmatchedNames.length} unmatched):`);
        unmatchedNames.slice(0, 30).forEach(n => console.log(`  ${n}`));
    }
}

main().catch(console.error);
