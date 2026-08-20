const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function post(body) {
  const res = await fetch(`${BASE}/api/artwork/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

async function freshToken() {
  const res = await fetch(`${BASE}/api/artwork/render-token`);
  if (!res.ok) throw new Error(`render-token returned ${res.status}`);
  return (await res.json()).token;
}

const token = await freshToken();
// Wait out the 3s minimum-dwell floor.
await new Promise(r => setTimeout(r, 3500));

const base = {
  token,
  contactPerson: 'Verify Bot',
  contactNumber: '0111234567',
  files: [{ name: 'logo.pdf', size: 1024, type: 'application/pdf' }],
};

const cases = [
  ['missing contact person', { ...base, contactPerson: '' }, 400],
  ['missing contact number', { ...base, contactNumber: '' }, 400],
  ['no files',               { ...base, files: [] },         400],
  ['bad extension',          { ...base, files: [{ name: 'x.exe', size: 10, type: 'application/octet-stream' }] }, 400],
  ['too many files',         { ...base, files: Array.from({ length: 11 }, (_, i) => ({ name: `f${i}.pdf`, size: 10, type: 'application/pdf' })) }, 400],
  ['oversize file',          { ...base, files: [{ name: 'big.pdf', size: 51 * 1024 * 1024, type: 'application/pdf' }] }, 400],
  ['bad email',              { ...base, email: 'not-an-email' }, 400],
];

let failed = false;
for (const [label, body, expected] of cases) {
  const { status } = await post(body);
  if (status !== expected) { console.error(`FAIL ${label}: got ${status}, expected ${expected}`); failed = true; }
  else console.log(`PASS ${label}`);
}

// Honeypot must look like success to a bot but create nothing.
const hp = await post({ ...base, website: 'http://spam.example' });
if (hp.status !== 200 || hp.json.id !== null) {
  console.error(`FAIL honeypot: expected 200 with id null, got ${hp.status} / ${JSON.stringify(hp.json)}`);
  failed = true;
} else console.log('PASS honeypot returns fake success');

// A token used immediately must be rejected by the dwell floor.
const fast = await post({ ...base, token: await freshToken() });
if (fast.status !== 400) { console.error(`FAIL too-fast: got ${fast.status}`); failed = true; }
else console.log('PASS too-fast rejected');

// A forged signature must be rejected.
const forged = await post({ ...base, token: `${Date.now() - 10000}.${'0'.repeat(64)}` });
if (forged.status !== 400) { console.error(`FAIL forged token: got ${forged.status}`); failed = true; }
else console.log('PASS forged token rejected');

// Happy path.
const ok = await post(base);
if (ok.status !== 200 || !ok.json.id || ok.json.uploads?.length !== 1) {
  console.error(`FAIL happy path: ${ok.status} / ${JSON.stringify(ok.json)}`);
  failed = true;
} else console.log(`PASS happy path (${ok.json.reference})`);

process.exit(failed ? 1 : 0);
