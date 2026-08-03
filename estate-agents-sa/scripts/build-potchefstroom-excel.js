const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

(async () => {
  const rawDir = path.resolve(__dirname, '..', 'raw');
  const outputPath = path.resolve(__dirname, '..', 'Potchefstroom-Estate-Agents.xlsx');

  // 1. Read all potchefstroom-*.jsonl files
  const files = fs.readdirSync(rawDir).filter(f => /^potchefstroom-.*\.jsonl$/.test(f));
  const allRecords = [];

  for (const file of files) {
    const filePath = path.join(rawDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      try {
        const obj = JSON.parse(trimmedLine);
        allRecords.push({
          company: String(obj.company ?? '').trim(),
          name: String(obj.name ?? '').trim(),
          title: String(obj.title ?? '').trim(),
          phone: String(obj.phone ?? '').trim(),
          email: String(obj.email ?? '').trim(),
          source: String(obj.source ?? '').trim(),
        });
      } catch (e) {
        // skip invalid JSON lines
      }
    }
  }

  const totalInput = allRecords.length;
  console.log(`Total input records: ${totalInput}`);

  // 2. Deduplicate records
  const seen = new Set();
  const outputRecords = [];

  for (const rec of allRecords) {
    // Dedupe by (company, name). NOTE: email/phone are NOT used as the key
    // because several agents at the same small agency share one fallback
    // company email/phone (their individual contact was JS-gated), and
    // 'source' is unreliable too (some agencies' records all point at one
    // shared team-roster page URL) - either would wrongly collapse distinct
    // people into a single row.
    const key = `${rec.company.toLowerCase()}|${rec.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    outputRecords.push(rec);
  }

  const totalOutput = outputRecords.length;
  console.log(`Deduped output records: ${totalOutput}`);

  // 3. Per-company breakdown
  const companyCounts = {};
  for (const rec of outputRecords) {
    const comp = rec.company || '(empty)';
    companyCounts[comp] = (companyCounts[comp] || 0) + 1;
  }
  console.log('Per-company breakdown:');
  Object.entries(companyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([company, count]) => {
      console.log(`  ${company}: ${count}`);
    });

  // 4. Sort output records
  outputRecords.sort((a, b) => {
    const cmp = a.company.localeCompare(b.company);
    if (cmp !== 0) return cmp;
    return a.name.localeCompare(b.name);
  });

  // 5. Build Excel workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Agents');

  sheet.columns = [
    { header: 'Company name', key: 'company', width: 12 },
    { header: 'Name and Surname', key: 'name', width: 12 },
    { header: 'Title', key: 'title', width: 12 },
    { header: 'Contact Number', key: 'phone', width: 12 },
    { header: 'Email Address', key: 'email', width: 12 },
  ];

  for (const rec of outputRecords) {
    sheet.addRow({
      company: rec.company,
      name: rec.name,
      title: rec.title,
      phone: rec.phone,
      email: rec.email,
    });
  }

  // 6. Bold header row and freeze panes
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };

  sheet.views = [
    { state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' },
  ];

  // 7. Auto-size columns (min 12, max 45)
  sheet.columns.forEach((column, colIndex) => {
    let maxLength = 12; // minimum
    const col = sheet.getColumn(colIndex + 1);
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value;
      const len = val ? String(val).length : 0;
      if (len > maxLength) maxLength = len;
    });
    maxLength = Math.min(maxLength, 45);
    column.width = maxLength;
  });

  // 8. Save workbook
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Workbook saved to ${outputPath}`);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
