-- Ember OS Spine — Plan B: MCP connector (OAuth 2.1 server + audit).
-- Ported from aloe-signs-website app/api/setup-mcp/route.ts. Service-role only.

create table if not exists mcp_clients (
  client_id     text primary key,
  client_name   text not null,
  redirect_uris text[] not null,
  created_at    timestamptz not null default now()
);

create table if not exists mcp_auth_codes (
  code_hash      text primary key,
  client_id      text not null,
  user_id        uuid not null,
  redirect_uri   text not null,
  code_challenge text not null,
  expires_at     timestamptz not null,
  used           boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists mcp_tokens (
  token_hash   text primary key,
  kind         text not null check (kind in ('access', 'refresh')),
  client_id    text not null,
  user_id      uuid not null,
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  last_used_at timestamptz,
  created_at   timestamptz not null default now()
);
-- Chain revocation on refresh-token reuse needs to find every sibling token.
create index if not exists mcp_tokens_user_client_idx on mcp_tokens (user_id, client_id);

create table if not exists mcp_rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  count        integer not null default 0
);

-- The kill switch. One UPDATE disables the connector without a redeploy.
create table if not exists mcp_settings (
  id      integer primary key default 1,
  enabled boolean not null default true,
  constraint mcp_settings_single_row check (id = 1)
);
insert into mcp_settings (id, enabled) values (1, true) on conflict (id) do nothing;

-- One row per tool call and per consent, so "what did Claude do" is answerable.
create table if not exists mcp_audit (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id    uuid not null,
  client_id  uuid references clients(id) on delete set null,
  action     text not null,
  tool       text,
  args       jsonb not null default '{}'::jsonb,
  summary    text not null
);
create index if not exists mcp_audit_client_idx on mcp_audit (client_id, created_at desc);

-- Fixed-window limiter, shared across serverless instances. Returns the count
-- in the current window after this hit; the caller compares it to its limit.
create or replace function mcp_rate_limit_hit(p_key text, p_window_seconds int)
returns int language sql as $$
  insert into mcp_rate_limits (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case
      when mcp_rate_limits.window_start < now() - (p_window_seconds * interval '1 second')
      then now() else mcp_rate_limits.window_start end,
    count = case
      when mcp_rate_limits.window_start < now() - (p_window_seconds * interval '1 second')
      then 1 else mcp_rate_limits.count + 1 end
  returning count;
$$;

-- Registration is open, so abandoned registrations expire after a day.
create or replace function mcp_sweep_stale_clients()
returns void language sql as $$
  delete from mcp_clients c
  where c.created_at < now() - interval '24 hours'
    and not exists (select 1 from mcp_tokens t where t.client_id = c.client_id);
$$;

alter table mcp_clients     enable row level security;
alter table mcp_auth_codes  enable row level security;
alter table mcp_tokens      enable row level security;
alter table mcp_rate_limits enable row level security;
alter table mcp_settings    enable row level security;
alter table mcp_audit       enable row level security;

notify pgrst, 'reload schema';
