import { readFileSync } from 'node:fs';

/** Returns '' when the file does not exist yet, so every check reports rather than crashing. */
function read(path) {
  try { return readFileSync(path, 'utf8'); }
  catch { console.error(`(missing file: ${path})`); return ''; }
}

const validation = read('lib/artwork/validation.ts');
const antibot    = read('lib/artwork/antibot.ts');
const form       = read('components/artwork/ArtworkUploadForm.tsx');

const checks = [
  [validation, /MAX_FILES\s*=\s*10\b/,                                'MAX_FILES is 10'],
  [validation, /MAX_FILE_BYTES\s*=\s*50\s*\*\s*1024\s*\*\s*1024\b/,   'MAX_FILE_BYTES is 50MB'],
  [validation, /MAX_TOTAL_BYTES\s*=\s*200\s*\*\s*1024\s*\*\s*1024\b/, 'MAX_TOTAL_BYTES is 200MB'],
  [validation, /'\.psd'/,                                             'psd allowed'],
  [validation, /'\.ai'/,                                              'ai allowed'],
  [antibot,    /MIN_SUBMIT_MS\s*=\s*3000\b/,                          'MIN_SUBMIT_MS is 3000'],
  [antibot,    /timingSafeEqual/,                                     'token signature compared in constant time'],
  [form,       /name="website"/,                                      'honeypot named website'],
];

let failed = false;
for (const [source, re, label] of checks) {
  if (!re.test(source)) { console.error(`FAIL: ${label}`); failed = true; }
  else console.log(`PASS: ${label}`);
}

// The honeypot must never be named `company` — this form has a real Company field,
// and reusing that name would silently discard every genuine submission.
if (/name="company"/i.test(form)) {
  console.error('FAIL: a field named "company" is used as the honeypot');
  failed = true;
} else {
  console.log('PASS: honeypot is not named company');
}

process.exit(failed ? 1 : 0);
