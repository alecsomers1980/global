alter table public.client_intelligence
  add column if not exists historical_voice text,
  add column if not exists top_performing_themes text[],
  add column if not exists posting_cadence_observed jsonb default '{}'::jsonb,
  add column if not exists best_performing_hours jsonb default '{}'::jsonb,
  add column if not exists last_scanned_at timestamptz;
