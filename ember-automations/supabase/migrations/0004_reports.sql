-- Ember OS Spine — Slice 2: monthly report + suggestions. Service-role only.

create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  client_id     uuid not null references clients(id) on delete cascade,
  period        text not null,
  status        text not null default 'draft' check (status in ('draft','approved','sent')),
  body          jsonb not null,
  outbox_id     uuid,
  link_token_id uuid,
  approved_at   timestamptz,
  sent_at       timestamptz,
  -- One report per client per month: this is what makes re-running the cron a no-op.
  unique (client_id, period)
);

create index if not exists reports_client_period_idx on reports (client_id, period desc);

drop trigger if exists reports_set_updated_at on reports;
create trigger reports_set_updated_at before update on reports
  for each row execute function set_updated_at();

-- A report is queued for Alec like any other outbound item, and carries a no-login link.
alter table outbox drop constraint if exists outbox_kind_check;
alter table outbox add constraint outbox_kind_check
  check (kind in ('reply','question_batch','estimate','fact_update','status_note','report'));

alter table link_tokens drop constraint if exists link_tokens_kind_check;
alter table link_tokens add constraint link_tokens_kind_check
  check (kind in ('request','question_batch','estimate','report'));

alter table reports enable row level security;

notify pgrst, 'reload schema';
