-- Stockist (wholesale) applications.
--
-- RLS is enabled with no policies, as with orders: applications carry a trader's
-- name, phone and email, and the form is public, so only the service role reads
-- or writes them.
--
-- Approval is manual and deliberately not automated — trade prices are never
-- shown on the public page, and status only moves from the admin queue.

create type stockist_status as enum ('new','contacted','approved','declined');

create table stockist_applications (
  id uuid primary key default gen_random_uuid(),
  status stockist_status not null default 'new',
  business text not null,
  contact text not null,
  email text not null,
  phone text not null,
  town text not null,
  stocking text,
  notes text,
  created_at timestamptz not null default now()
);

create index stockist_applications_status_idx
  on stockist_applications (status, created_at desc);

alter table stockist_applications enable row level security;
