/**
 * Verifies the SQL semantics of markDownloaded(): first download sets a 7-day
 * clock, a second download must NOT extend it.
 *
 * SCOPE: this exercises the exact statement from lib/artwork/repository.ts, not
 * the HTTP route, which requires a staff session. Confirm the route itself by
 * signing in and clicking Download once.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

let failed = false;
const check = (ok, label, detail = '') => {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}${detail ? ': ' + detail : ''}`); failed = true; }
};

const { rows } = await sql`
  INSERT INTO artwork_submissions
    (reference, contact_person, contact_number, status, ip_hash, delete_after)
  VALUES ('AW-CLOCK', 'Clock Bot', '0000000000', 'received', 'clockhash', NOW() + INTERVAL '30 days')
  RETURNING id
`;
const id = rows[0].id;

const markDownloaded = () => sql.query(
  `UPDATE artwork_submissions
   SET downloaded_at = NOW(), delete_after = NOW() + INTERVAL '7 days'
   WHERE id = $1 AND downloaded_at IS NULL`,
  [id]
);

const read = async () => (await sql`
  SELECT downloaded_at, delete_after,
         EXTRACT(EPOCH FROM (delete_after - NOW())) / 86400 AS days_left
  FROM artwork_submissions WHERE id = ${id}
`).rows[0];

const before = await read();
check(Math.round(before.days_left) === 30, 'starts at 30 days', `${before.days_left}`);
check(before.downloaded_at === null, 'starts undownloaded');

const first = await markDownloaded();
check(first.rowCount === 1, 'first download updated the row');
const afterFirst = await read();
check(Math.round(afterFirst.days_left) === 7, 'clock reset to 7 days', `${afterFirst.days_left}`);
check(afterFirst.downloaded_at !== null, 'downloaded_at recorded');

const second = await markDownloaded();
check(second.rowCount === 0, 'second download is a no-op (does not extend the clock)');
const afterSecond = await read();
check(
  new Date(afterSecond.delete_after).getTime() === new Date(afterFirst.delete_after).getTime(),
  'delete_after unchanged by the second download'
);

await sql`DELETE FROM artwork_submissions WHERE id = ${id}`;
process.exit(failed ? 1 : 0);
