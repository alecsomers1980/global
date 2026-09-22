-- Tindlovu Group seed. Idempotent on clients.slug and on each row's natural key.
insert into clients (slug, name, vertical, status, approval_mode, ai_provider, plan, notes)
select 'tindlovu', 'Tindlovu Group', 'hospitality', 'active', 'A', 'deepseek',
  '{"monthly_credits":0,"max_active":1,"credit_sizes":{"S":1,"M":3,"L":6},"turnaround":{"S":"48h","M":"5wd","L":"quoted"},"rollover":false,"renews_on":1}'::jsonb,
  'Kruger National Park hospitality group: restaurants, curio retail, weddings, bush dining. Units include Afsaal (GAAP nodes Afsaal Express + Afsaal Retail) and Berg en Dal. Credits set to 0 until an agreement is signed.'
where not exists (select 1 from clients where slug = 'tindlovu');

with c as (select id from clients where slug = 'tindlovu')
insert into client_people (client_id, name, role, signs_off_on, is_primary, notes)
select c.id, v.name, v.role, v.signs, v.prim, v.notes from c, (values
  ('Lizette', 'Head office — payroll & timesheets', array['timesheets','monthly reconciliation'], true, 'Reconciles GAAP exports against Excel by hand every month'),
  ('J White', 'Overtime approver', array['overtime'], false, 'Approves OT at head office')
) as v(name, role, signs, prim, notes)
where not exists (select 1 from client_people p where p.client_id = c.id and p.name = v.name);

with c as (select id from clients where slug = 'tindlovu')
insert into client_systems (client_id, name, kind, notes)
select c.id, v.name, v.kind, v.notes from c, (values
  ('GAAP Unity Timecard', 'pos', 'Clock-in/out punches per unit; exports re-keyed into Excel monthly; GAAP names differ from Excel names (aliases needed)'),
  ('Excel timesheets', 'payroll', 'Monthly admin sheets per unit; the current system of record for hours'),
  ('Google Drive', 'storage', 'Documents portal backend'),
  ('Tindlovu documents portal', 'other', 'Next.js 16 + Supabase portal on Vercel: profiles, branches, sections, permissions, documents')
) as v(name, kind, notes)
where not exists (select 1 from client_systems s where s.client_id = c.id and s.name = v.name);

with c as (select id from clients where slug = 'tindlovu')
insert into client_processes (client_id, name, frequency, volume, pain, notes)
select c.id, v.name, v.freq, v.vol, v.pain, v.notes from c, (values
  ('Monthly timesheet reconciliation', 'monthly', 'All staff across units; employees are group-wide and transfer mid-month', 'GAAP re-keyed into Excel by hand; head office reconciles manually; rules applied inconsistently', 'Phase 1 actuals engine spec: tindlovu-documents/docs/superpowers/specs/2026-09-14-timesheets-phase1-actuals-design.md'),
  ('Roster planning', 'weekly', 'Per unit per day', 'Planned vs actual is not compared', 'Phase 2 of the timesheets programme'),
  ('Overtime approval', 'monthly', 'Per employee', 'Unauthorised OT is netted off balances by hand', 'Approved by J White')
) as v(name, freq, vol, pain, notes)
where not exists (select 1 from client_processes p where p.client_id = c.id and p.name = v.name);

with c as (select id from clients where slug = 'tindlovu')
insert into client_facts (client_id, statement, source, source_ref, status, confirmed_at)
select c.id, v.stmt, 'spec', '2026-09-14-timesheets-phase1-actuals-design.md §8', 'confirmed', now() from c, (values
  ('Clock-in is trimmed to 07:00; lunch of 0.5h deducted only when raw hours >= 5; hours rounded DOWN to 0.25'),
  ('Standard day is 7.5h; daily overtime is anything above 7.5h; leave day = 7.5h'),
  ('Night hours count after 18:00 at Berg en Dal only'),
  ('Contract hours are 195 or 160 per month depending on the employee'),
  ('Balance = opening + variance − unauthorised OT − OT paid ± variable hours'),
  ('Rules were inferred from the July reconciliation and matched 95% of clean August days within 0.25h — still to be confirmed by the client')
) as v(stmt)
where not exists (select 1 from client_facts f where f.client_id = c.id and f.statement = v.stmt);

with c as (select id from clients where slug = 'tindlovu')
insert into client_assets (client_id, kind, label, url, status)
select c.id, v.kind, v.label, v.url, 'unknown' from c, (values
  ('site', 'Tindlovu documents portal (Vercel)', null),
  ('supabase', 'Documents portal Supabase project', null),
  ('site', 'www.tindlovu.co.za (marketing site, not ours)', 'https://www.tindlovu.co.za')
) as v(kind, label, url)
where not exists (select 1 from client_assets a where a.client_id = c.id and a.label = v.label);

-- First question batch: the 11 confirm-with-client questions from spec §8, status 'draft' (Alec approves the batch in the queue).
with c as (select id from clients where slug = 'tindlovu'), b as (select gen_random_uuid() as batch_id)
insert into questions (client_id, batch_id, text, why, status)
select c.id, b.batch_id, v.text, v.why, 'draft' from c, b, (values
  ('Is the 07:00 clock-in trim applied at every unit, or only where the gate opens at 07:00?', 'Rule inferred from July data; unit-specific exceptions would change the engine'),
  ('Is the 0.5h lunch deduction applied only when raw hours are 5 or more, and never twice on a split shift?', 'Split shifts appeared in August data'),
  ('Are hours always rounded down to the nearest quarter hour, including for overtime?', 'Rounding direction changes balances materially'),
  ('Which employees are on 195 contract hours and which on 160?', 'Needed per employee for balances'),
  ('Is a leave day always credited as 7.5h regardless of the roster?', 'Affects month-end balance'),
  ('Do night hours after 18:00 apply only at Berg en Dal, or also at Afsaal on event nights?', 'Berg en Dal only in the data we have'),
  ('Who may authorise overtime, and is unauthorised overtime always deducted from the balance?', 'J White approves today; confirm the rule for balances'),
  ('When an employee transfers between units mid-month, which unit carries their hours for that month?', 'Employees are group-wide'),
  ('Which four GAAP nodes map to which physical unit?', 'GAAP names differ from Excel names'),
  ('Can we get the July GAAP export and a Berg en Dal export to test against?', 'August alone is one month of evidence'),
  ('Should the monthly timesheet show opening balance, movements and closing balance per employee exactly as the current Excel does?', 'Reporting format the client expects')
) as v(text, why)
where not exists (select 1 from questions q where q.client_id = c.id and q.text = v.text);

with c as (select id from clients where slug = 'tindlovu'),
     q as (
       select batch_id, array_agg(id) as ids, jsonb_agg(jsonb_build_object('text', text, 'why', why) order by created_at) as qs
       from questions where client_id = (select id from c) and status = 'draft' group by batch_id limit 1
     )
insert into outbox (client_id, kind, ref_table, ref_id, draft, shadow_b)
select c.id, 'question_batch', 'questions', q.batch_id,
       jsonb_build_object('batch_id', q.batch_id, 'question_ids', to_jsonb(q.ids), 'questions', q.qs, 'title', 'Timesheet rules — 11 questions'),
       true
from c, q
where not exists (select 1 from outbox o where o.client_id = c.id and o.kind = 'question_batch' and o.ref_id = q.batch_id);
