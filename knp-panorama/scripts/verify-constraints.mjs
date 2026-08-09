/**
 * Enforces the three hard constraints from the design spec:
 *   §1 — no commerce of any kind
 *   §1 — no prices anywhere
 *   §7 — no fabricated social proof
 *
 * Run with `npm run verify`. A hit is a real failure: fix the source rather
 * than relaxing a pattern here.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const CHECKS = [
  {
    name: 'no commerce references',
    pattern: /add[- ]?to[- ]?cart|checkout|paygate|woocommerce|"offers"|priceRange/i,
  },
  {
    name: 'no prices',
    pattern: /R\s?[0-9]{3}|ZAR|\$[0-9]|\bUSD\b|\bEUR\b|\bprice\b|\bpricing\b/,
  },
  {
    name: 'no fabricated social proof',
    pattern: /testimonial|star-?rating|reviewCount|aggregateRating|[0-9]+\+? (years|tours|camps|guests|customers)/i,
  },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk(path.join(process.cwd(), 'src'));
let failed = false;

for (const check of CHECKS) {
  const hits = [];
  for (const file of files) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (check.pattern.test(line)) {
          hits.push(`${path.relative(process.cwd(), file)}:${i + 1}  ${line.trim().slice(0, 100)}`);
        }
      });
  }

  if (hits.length > 0) {
    failed = true;
    console.error(`FAIL — ${check.name}`);
    hits.forEach((h) => console.error(`   ${h}`));
  } else {
    console.log(`PASS — ${check.name}`);
  }
}

console.log(`\nscanned ${files.length} source files`);
process.exit(failed ? 1 : 0);
