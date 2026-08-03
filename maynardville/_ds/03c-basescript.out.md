===FILE: scripts/create-airtable-base.mjs===
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ----------------------------------------------------------------------
// Environment loading
// ----------------------------------------------------------------------
function loadEnvVars() {
  const key = 'AIRTABLE_API_KEY';
  const baseId = 'AIRTABLE_BASE_ID';

  // 1. process.env
  let keyVal = process.env[key];
  let baseIdVal = process.env[baseId];

  // 2. minimal .env.local parser (sibling file)
  if (!keyVal || !baseIdVal) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.join(__dirname, '.env.local');
    if (existsSync(envPath)) {
      const raw = readFileSync(envPath, 'utf8');
      const parsed = {};
      for (let line of raw.split('\n')) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const name = line.slice(0, eqIdx).trim();
        const value = line.slice(eqIdx + 1).trim();
        parsed[name] = value;
      }
      if (!keyVal) keyVal = parsed[key];
      if (!baseIdVal) baseIdVal = parsed[baseId];
    }
  }

  if (!keyVal || !baseIdVal) {
    console.error(
      'Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID.\n' +
        'Set them as environment variables or in a sibling .env.local file.'
    );
    process.exit(1);
  }
  return { API_KEY: keyVal, BASE_ID: baseIdVal };
}

// ----------------------------------------------------------------------
// API helpers
// ----------------------------------------------------------------------
const BASE_URL = 'https://api.airtable.com/v0/meta/bases';

async function request(method, url, bodyObj = undefined) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (bodyObj !== undefined) {
    options.body = JSON.stringify(bodyObj);
  }
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    const msg = `Airtable API error ${res.status}: ${JSON.stringify(data)}`;
    throw new Error(msg);
  }
  return data;
}

async function getTables() {
  const url = `${BASE_URL}/${BASE_ID}/tables`;
  const data = await request('GET', url);
  return data.tables; // array of {id, name, ...}
}

async function getTableDetails(tableId) {
  const url = `${BASE_URL}/${BASE_ID}/tables/${tableId}`;
  const data = await request('GET', url);
  return data; // includes fields array
}

async function createTable(name, fields) {
  const url = `${BASE_URL}/${BASE_ID}/tables`;
  const body = { name, fields };
  const data = await request('POST', url, body);
  return data; // full table object including id and fields
}

async function createField(tableId, fieldDef) {
  const url = `${BASE_URL}/${BASE_ID}/tables/${tableId}/fields`;
  const data = await request('POST', url, fieldDef);
  return data;
}

// ----------------------------------------------------------------------
// Table definitions (PASS 1 – no linked fields yet)
// ----------------------------------------------------------------------
const DESIRED_TABLES = [
  {
    name: 'Categories',
    fields: [
      { name: 'Category Name', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
    ],
  },
  {
    name: 'Users',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      {
        name: 'Role',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Admin' },
            { name: 'Box Office' },
            { name: 'PR & Media' },
            { name: 'Sponsorships' },
            { name: 'Operations' },
          ],
        },
      },
      { name: 'Department', type: 'singleLineText' },
      { name: 'Can Approve', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
    ],
  },
  {
    name: 'Performances',
    fields: [
      { name: 'Production/Event', type: 'singleLineText' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'iso' } } },
      { name: 'Time', type: 'singleLineText' },
      { name: 'Venue', type: 'singleLineText' },
      { name: 'Capacity', type: 'number', options: { precision: 0 } },
      {
        name: 'Season',
        type: 'singleSelect',
        options: {
          choices: [{ name: '2025' }, { name: '2026' }, { name: '2027' }],
        },
      },
      { name: 'Quicket Event ID', type: 'number', options: { precision: 0 } },
      { name: 'Quicket Schedule ID', type: 'number', options: { precision: 0 } },
      {
        name: 'Performance Type',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Public' },
            { name: 'School' },
            { name: 'SASL-interpreted' },
            { name: 'VIP' },
          ],
        },
      },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
    ],
  },
  {
    name: 'Requesters',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      {
        name: 'Role',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Festival Organiser' },
            { name: 'PR & Media' },
            { name: 'Box Office' },
            { name: 'Sponsorships' },
            { name: 'Operations' },
          ],
        },
      },
      { name: 'Magic Link Token', type: 'singleLineText' },
      { name: 'Token Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
      { name: 'Active', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
    ],
  },
  {
    name: 'Guests',
    fields: [
      { name: 'Full Name', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Organisation', type: 'singleLineText' },
    ],
  },
  {
    name: 'Comp Requests',
    fields: [
      { name: 'Guest Name', type: 'singleLineText' },
      { name: 'Guest Surname', type: 'singleLineText' },
      { name: 'Guest Email', type: 'email' },
      { name: 'House Seats', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
      { name: 'Notes', type: 'multilineText' },
      { name: 'Total Seats Requested', type: 'number', options: { precision: 0 } },
      {
        name: 'Ticket Status',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'REQUEST' },
            { name: 'TO APPROVE' },
            { name: 'APPROVED' },
            { name: 'TO ISSUE' },
            { name: 'ISSUED' },
            { name: 'DECLINED' },
            { name: 'CANCELLED' },
            { name: 'DUPLICATE/ERROR' },
          ],
        },
      },
      { name: 'Seat Numbers', type: 'singleLineText' },
      { name: 'Ticket Reference', type: 'singleLineText' },
      {
        name: 'Approved At',
        type: 'dateTime',
        options: {
          dateFormat: { name: 'iso' },
          timeFormat: { name: '24hour' },
          timeZone: 'Africa/Johannesburg',
        },
      },
    ],
  },
  {
    name: 'Quicket Sales',
    fields: [
      { name: 'Ticket Type Name', type: 'singleLineText' },
      { name: 'Quicket Ticket Type ID', type: 'number', options: { precision: 0 } },
      { name: 'Price', type: 'number', options: { precision: 2 } },
      { name: 'Quantity Sold', type: 'number', options: { precision: 0 } },
      {
        name: 'Synced At',
        type: 'dateTime',
        options: {
          dateFormat: { name: 'iso' },
          timeFormat: { name: '24hour' },
          timeZone: 'Africa/Johannesburg',
        },
      },
    ],
  },
  {
    name: 'Approval Log',
    fields: [
      { name: 'Summary', type: 'singleLineText' },
      {
        name: 'Action',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Submitted' },
            { name: 'Approved' },
            { name: 'Declined' },
            { name: 'Issued' },
            { name: 'Status Override' },
            { name: 'Edited' },
            { name: 'Cancelled' },
          ],
        },
      },
      {
        name: 'Timestamp',
        type: 'dateTime',
        options: {
          dateFormat: { name: 'iso' },
          timeFormat: { name: '24hour' },
          timeZone: 'Africa/Johannesburg',
        },
      },
      { name: 'From Status', type: 'singleLineText' },
      { name: 'To Status', type: 'singleLineText' },
      { name: 'Note', type: 'multilineText' },
    ],
  },
];

// ----------------------------------------------------------------------
// Linked‑field definitions (PASS 2)
// ----------------------------------------------------------------------
const DESIRED_LINKS = [
  { table: 'Requesters', fieldName: 'Allowed Categories', linkedTable: 'Categories' },
  { table: 'Comp Requests', fieldName: 'Performance', linkedTable: 'Performances' },
  { table: 'Comp Requests', fieldName: 'Category', linkedTable: 'Categories' },
  { table: 'Comp Requests', fieldName: 'Requester', linkedTable: 'Requesters' },
  { table: 'Comp Requests', fieldName: 'Guest', linkedTable: 'Guests' },
  { table: 'Comp Requests', fieldName: 'Approved By', linkedTable: 'Users' },
  { table: 'Quicket Sales', fieldName: 'Performance', linkedTable: 'Performances' },
  { table: 'Approval Log', fieldName: 'Related Comp Request', linkedTable: 'Comp Requests' },
  { table: 'Approval Log', fieldName: 'Performed By', linkedTable: 'Users' },
];

// ----------------------------------------------------------------------
// Main execution
// ----------------------------------------------------------------------
async function main() {
  console.log('🔧 Loading environment…');
  const env = loadEnvVars();
  API_KEY = env.API_KEY;  // eslint-disable-line no-undef
  BASE_ID = env.BASE_ID;  // eslint-disable-line no-undef

  // 1. Snapshot current base state
  console.log('📋 Fetching existing base structure…');
  const existingTables = await getTables();

  // Build fast lookup: table name → { id, fieldsSet }
  const tableMap = new Map(); // name -> { id, fieldsSet }
  for (const t of existingTables) {
    const details = await getTableDetails(t.id);
    const fieldNames = new Set(details.fields.map((f) => f.name));
    tableMap.set(details.name, { id: details.id, fieldsSet: fieldNames });
  }

  // ---- PASS 1: ensure tables and non‑link fields exist ----
  console.log('\n🏗️  PASS 1: creating missing tables & fields…');
  for (const tableDef of DESIRED_TABLES) {
    const { name, fields } = tableDef;
    let current = tableMap.get(name);

    if (!current) {
      // Table doesn’t exist – create it with all fields
      try {
        console.log(`  ➕ Creating table "${name}"…`);
        const created = await createTable(name, fields);
        const fieldSet = new Set(created.fields.map((f) => f.name));
        tableMap.set(name, { id: created.id, fieldsSet: fieldSet });
        console.log(`     ✅ Created table "${name}" (id: ${created.id})`);
        continue;
      } catch (err) {
        console.error(`     ❌ Failed to create table "${name}": ${err.message}`);
        process.exit(1);
      }
    }

    // Table exists – add any missing fields
    const tableId = current.id;
    const existingFields = current.fieldsSet;
    for (const fieldDef of fields) {
      if (!existingFields.has(fieldDef.name)) {
        try {
          console.log(`     ➕ Adding field "${fieldDef.name}" to "${name}"…`);
          await createField(tableId, fieldDef);
          existingFields.add(fieldDef.name);
          console.log(`        ✅ Created field "${fieldDef.name}"`);
        } catch (err) {
          console.error(`        ❌ Failed to create field "${fieldDef.name}": ${err.message}`);
          process.exit(1);
        }
      } else {
        console.log(`     ⏩ Skipping existing field "${fieldDef.name}" in "${name}"`);
      }
    }
  }

  // Refresh field sets for all desired tables (some fields may have been added)
  console.log('\n🔄 Refreshing field lists before PASS 2…');
  for (const [tableName, data] of tableMap.entries()) {
    const details = await getTableDetails(data.id);
    data.fieldsSet = new Set(details.fields.map((f) => f.name));
  }

  // ---- PASS 2: add linked‑record fields ----
  console.log('\n🔗 PASS 2: adding linked‑record fields…');
  for (const link of DESIRED_LINKS) {
    const sourceTableData = tableMap.get(link.table);
    if (!sourceTableData) {
      console.log(`  ⚠️  Source table "${link.table}" not found – skipping link.`);
      continue;
    }
    const linkedTableData = tableMap.get(link.linkedTable);
    if (!linkedTableData) {
      console.log(`  ⚠️  Linked table "${link.linkedTable}" not found – skipping link.`);
      continue;
    }
    if (sourceTableData.fieldsSet.has(link.fieldName)) {
      console.log(`  ⏩ Skipping existing link field "${link.fieldName}" in "${link.table}"`);
      continue;
    }

    try {
      console.log(`  ➕ Adding link "${link.fieldName}" → "${link.linkedTable}" in "${link.table}"…`);
      await createField(sourceTableData.id, {
        name: link.fieldName,
        type: 'multipleRecordLinks',
        options: { linkedTableId: linkedTableData.id },
      });
      sourceTableData.fieldsSet.add(link.fieldName); // keep local set updated
      console.log(`     ✅ Created link field "${link.fieldName}"`);
    } catch (err) {
      console.error(`     ❌ Failed to create link field "${link.fieldName}": ${err.message}`);
      process.exit(1);
    }
  }

  // ---- Manual fields checklist ----
  console.log('\n📝 MANUAL FIELDS TO ADD IN THE AIRTABLE UI');
  console.log('   (These are computed / system fields not created via API)');
  console.log(`
  [Comp Requests]
    • "Submitted At"          — Created time
    • "Request Reference"     — Autonumber or formula: "REQ-" & id
    • "Missing Issue Data"    — Formula: AND({Ticket Status}="ISSUED", OR({Seat Numbers}=BLANK(), {Ticket Reference}=BLANK()))
    • "Season"                — Lookup from Performance
  [Performances]
    • "Performance Label"     — Formula (e.g., {Production/Event} & " – " & {Date})
    • "Comp Seats Requested"  — Rollup (SUM of Comp Requests > Total Seats Requested)
    • "Comp Seats Issued"     — Rollup (COUNT of Comp Requests where Ticket Status = ISSUED)
  [Quicket Sales]
    • "Gross"                 — Formula: {Price} * {Quantity Sold}
  [Guests]
    • "Events Attended"       — Rollup (COUNT of Comp Requests)
`);

  console.log('✅ Base structure creation / update complete.');
}

let API_KEY, BASE_ID; // module‑level variables for helpers

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
===END===