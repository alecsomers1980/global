// Helper: append JSON records to a jsonl file, one per line.
// Usage: node append.js <targetFile.jsonl> <recordsJsonArrayFile.json>
const fs = require('fs');
const target = process.argv[2];
const recordsFile = process.argv[3];
const records = JSON.parse(fs.readFileSync(recordsFile, 'utf8'));
const lines = records.map(r => JSON.stringify(r)).join('\n') + '\n';
fs.appendFileSync(target, lines);
console.log(`Appended ${records.length} records to ${target}`);
