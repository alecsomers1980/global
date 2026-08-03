/**
 * Script: build-excel.js
 * Purpose: Read JSONL files from raw folder, deduplicate, clean, and generate
 *          a formatted Excel workbook using exceljs.
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// =========================
// CONFIGURATION
// =========================
const RAW_DIR = 'c:/Users/info/OneDrive/Documents/Antigravity/estate-agents-sa/raw';
const OUTPUT_FILE = 'c:/Users/info/OneDrive/Documents/Antigravity/estate-agents-sa/South-Africa-Estate-Agents.xlsx';
const HEADERS = ['Company name', 'Name and Surname', 'Title', 'Contact Number', 'Email Address', 'Area'];

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Remove characters invalid in Excel sheet names and truncate to 31 chars.
 */
function sanitizeSheetName(name) {
    // Remove: : \ / ? * [ ]
    return name.replace(/[:\\\/?*[\]]/g, '').substring(0, 31);
}

/**
 * Add a worksheet to the workbook with given name and data.
 * Applies header styling, frozen row, and auto-sized columns.
 */
function addSheet(workbook, sheetName, data) {
    const ws = workbook.addWorksheet(sheetName);
    ws.views = [{ state: 'frozen', ySplit: 1 }]; // freeze top row

    // Add header row with bold font and light gray fill
    const headerRow = ws.addRow(HEADERS);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' } // light gray
    };

    // Add data rows
    for (const rec of data) {
        ws.addRow([
            rec.company || '',
            rec.name || '',
            rec.title || '',
            rec.phone || '',
            rec.email || '',
            rec.area || ''
        ]);
    }

    // Calculate max length of each column for auto-sizing
    const maxLengths = HEADERS.map(h => h.length);
    for (const rec of data) {
        const vals = [
            rec.company || '',
            rec.name || '',
            rec.title || '',
            rec.phone || '',
            rec.email || '',
            rec.area || ''
        ];
        vals.forEach((val, i) => {
            const len = String(val).length;
            if (len > maxLengths[i]) maxLengths[i] = len;
        });
    }

    // Set column widths (adding a little padding)
    ws.columns = maxLengths.map(len => ({ width: Math.max(len + 2, 10) }));
}

// =========================
// MAIN PROCESS
// =========================
(async () => {
    console.log('Building Excel workbook...');

    // ---------- 1. Read all JSONL files ----------
    let totalRead = 0;
    const allRecords = [];

    const files = fs.readdirSync(RAW_DIR).filter(f => f.toLowerCase().endsWith('.jsonl'));
    for (const file of files) {
        const content = fs.readFileSync(path.join(RAW_DIR, file), 'utf-8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                const obj = JSON.parse(trimmed);
                allRecords.push(obj);
                totalRead++;
            } catch (err) {
                // Skip lines that cannot be parsed as JSON
                console.warn(`Skipping unparseable line in ${file}: ${trimmed.substring(0, 80)}`);
            }
        }
    }

    // ---------- 2 & 3. Deduplicate and drop useless records ----------
    const emailKeys = new Set();    // keys for records WITH email
    const phoneOnlyKeys = new Set();// keys for records WITH phone but NO email
    const deduped = [];
    let droppedBlank = 0;

    for (const rec of allRecords) {
        const email = (rec.email || '').trim();
        const phone = (rec.phone || '').trim();

        // Drop records where both are blank
        if (email === '' && phone === '') {
            droppedBlank++;
            continue;
        }

        // Dedup: email present => use email, otherwise use phone
        if (email !== '') {
            const key = email.toLowerCase();
            if (emailKeys.has(key)) {
                continue; // duplicate
            }
            emailKeys.add(key);
        } else {
            // phone‑only record
            const key = phone;
            if (phoneOnlyKeys.has(key)) {
                continue; // duplicate
            }
            phoneOnlyKeys.add(key);
        }

        // Keep this record (normalise fields to strings)
        deduped.push({
            company: (rec.company || '').trim(),
            name: (rec.name || '').trim(),
            title: (rec.title || '').trim(),
            phone: phone,
            email: email,
            area: (rec.area || '').trim()
        });
    }

    const totalAfterDedup = deduped.length;

    // ---------- 4. Prepare sorted data for All Gauteng sheet ----------
    const sortedAll = [...deduped].sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        if (a.company < b.company) return -1;
        if (a.company > b.company) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    // Group records by area
    const areaMap = new Map();
    for (const rec of deduped) {
        if (!areaMap.has(rec.area)) areaMap.set(rec.area, []);
        areaMap.get(rec.area).push(rec);
    }
    const sortedAreas = Array.from(areaMap.keys()).sort();

    // ---------- 5. Create workbook ----------
    const workbook = new ExcelJS.Workbook();

    // ----- All Gauteng sheet (must be leftmost) -----
    addSheet(workbook, 'All Gauteng', sortedAll);

    // ----- One sheet per area -----
    for (const area of sortedAreas) {
        const sheetName = sanitizeSheetName(area) || 'Area'; // fallback if sanitized becomes empty
        addSheet(workbook, sheetName, areaMap.get(area));
    }

    // ---------- 6. Write file ----------
    await workbook.xlsx.writeFile(OUTPUT_FILE);
    console.log(`Workbook written to ${OUTPUT_FILE}`);

    // ---------- 7. Summary ----------
    console.log('\n=== SUMMARY ===');
    console.log('Total records read:', totalRead);
    console.log('Total after dedup:', totalAfterDedup);
    console.log('Total dropped (both phone & email blank):', droppedBlank);

    console.log('\nBreakdown by Area:');
    sortedAreas.forEach(area => {
        console.log(`  ${area}: ${areaMap.get(area).length}`);
    });

    // Count per company
    const companyCounts = new Map();
    for (const rec of deduped) {
        const company = rec.company || '(blank)';
        companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
    }
    const sortedCompanies = Array.from(companyCounts.keys()).sort();

    console.log('\nBreakdown by Company name:');
    sortedCompanies.forEach(company => {
        console.log(`  ${company}: ${companyCounts.get(company)}`);
    });

})().catch(err => {
    console.error('Error building Excel workbook:', err);
    process.exit(1);
});
