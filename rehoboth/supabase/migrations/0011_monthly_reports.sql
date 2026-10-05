-- Monthly reports.
--
-- One row and one PDF per month. Regenerating a month upserts both, so there
-- is never a second copy of the same month to disagree with the first.
-- RLS on with no policies, as with orders: only the service role reads it, and
-- the admin downloads through a short-lived signed URL.

create table monthly_reports (
  month        text primary key,            -- '2026-09'
  storage_path text not null,               -- '2026-09.pdf' in the reports bucket
  generated_at timestamptz not null default now(),
  emailed_to   text[] not null default '{}',
  email_error  text,
  ga_available boolean not null,
  ai_included  boolean not null
);

alter table monthly_reports enable row level security;

-- Private bucket: unlike product photos these are business figures, and are
-- only ever served through a signed URL minted after an admin check.
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- "Stockists approved this month" needs to know when the status changed.
-- Existing rows are back-filled with created_at rather than now(), or every
-- application approved before today would count as approved this month.
alter table stockist_applications add column updated_at timestamptz;
update stockist_applications set updated_at = created_at;
alter table stockist_applications
  alter column updated_at set not null,
  alter column updated_at set default now();

create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger stockist_applications_touch
  before update on stockist_applications
  for each row execute function touch_updated_at();
