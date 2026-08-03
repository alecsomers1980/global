-- Moves the admin password off a static env var so it can actually be
-- changed/reset, and adds password-reset tokens for the forgot-password flow.
-- Both tables have RLS enabled with NO policies: only the service_role key
-- (used server-side in API routes) can read/write them, never the public
-- anon key used by the browser.

create table if not exists admin_account (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists admin_password_resets (
  token text primary key,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

alter table admin_account enable row level security;
alter table admin_password_resets enable row level security;

-- Seed the single admin account from the current ADMIN_PASSWORD
-- ("mountaincreek2024") so nothing breaks on migration.
insert into admin_account (email, password_hash)
select 'info@mountaincreeklodge.co.za', '$2b$10$tqiE/H.kM0RkmYIX5RXLfusUCU3OTm2H2tE2D8yIKnNEbWo5CDg32'
where not exists (select 1 from admin_account);
