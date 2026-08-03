// Applies DeepSeek output containing one or more file blocks to disk.
// Format expected in the response file:
//   ===FILE: <absolute-or-project-relative-path>===
//   <full file content>
//   ===END===
// Usage: node ds-apply.js <responseFile> <projectRoot>
const fs = require('fs');
const path = require('path');

const [, , respFile, projectRoot] = process.argv;
if (!respFile || !projectRoot) {
  console.error('Usage: node ds-apply.js <responseFile> <projectRoot>');
  process.exit(1);
}
let text = fs.readFileSync(respFile, 'utf8');

// strip any stray markdown fences that wrap the whole thing
const re = /===FILE:\s*(.+?)\s*===\r?\n([\s\S]*?)\r?\n===END===/g;
let m, count = 0;
while ((m = re.exec(text)) !== null) {
  let rel = m[1].trim();
  let content = m[2];
  // remove leading/trailing markdown code fences if DeepSeek added them
  content = content.replace(/^```[a-zA-Z]*\r?\n/, '').replace(/\r?\n```\s*$/, '');
  const full = path.isAbsolute(rel) ? rel : path.join(projectRoot, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('WROTE', rel, `(${content.length} chars)`);
  count++;
}
if (count === 0) {
  console.error('NO FILE BLOCKS FOUND. First 400 chars:\n' + text.slice(0, 400));
  process.exit(2);
}
console.log(`Applied ${count} file(s).`);
