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
  [form,       /name={HONEYPOT_FIELD}/,                              "honeypot uses the shared constant"],
];

let failed = false;
for (const [source, re, label] of checks) {
  if (!re.test(source)) { console.error(`FAIL: ${label}`); failed = true; }
  else console.log(`PASS: ${label}`);
}

// The honeypot name is load-bearing. Two names have already caused, or would have
// caused, real submissions to be silently discarded:
//   `company` — this form has a genuine Company Name field
//   `website` — Chrome autofills it from the saved profile (this actually happened)
// The name must stay meaningless to both humans and browser autofill.
const BANNED_HONEYPOT_NAMES = ['company', 'website', 'url', 'email', 'name', 'phone', 'address'];
const declared = (antibot.match(/HONEYPOT_FIELD\s*=\s*'([^']+)'/) || [])[1];

if (!declared) {
  console.error('FAIL: HONEYPOT_FIELD constant not found in antibot.ts');
  failed = true;
} else if (BANNED_HONEYPOT_NAMES.includes(declared.toLowerCase())) {
  console.error(`FAIL: honeypot named "${declared}" — browser autofill or a real field will collide with it`);
  failed = true;
} else {
  console.log(`PASS: honeypot name "${declared}" is autofill-safe`);
}

// The form must carry the password-manager opt-outs too.
if (!/data-lpignore/.test(form) || !/data-1p-ignore/.test(form)) {
  console.error('FAIL: honeypot missing password-manager ignore attributes');
  failed = true;
} else {
  console.log('PASS: honeypot opts out of password managers');
}

process.exit(failed ? 1 : 0);
