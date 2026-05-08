-- ================================================
-- Ember Social Media Automation — Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- WORKSPACES (one per client)
-- ================================================
create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz default now()
);

alter table public.workspaces enable row level security;
create policy "Agency admins can manage all workspaces"
  on public.workspaces for all
  using (auth.role() = 'authenticated');

-- ================================================
-- CLIENT INTELLIGENCE (the AI brain per client)
-- ================================================
create table public.client_intelligence (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  industry text,
  target_audience text,
  brand_voice text,
  goals text,
  current_month_focus text,
  key_messages text[],
  do_not_post text[],
  learned_preferences jsonb default '{}'::jsonb,
  last_updated_at timestamptz default now(),
  unique(workspace_id)
);

alter table public.client_intelligence enable row level security;
create policy "Agency admins manage client intelligence"
  on public.client_intelligence for all
  using (auth.role() = 'authenticated');

-- ================================================
-- CLIENT INTEL NOTES (ongoing learning notes)
-- ================================================
create table public.client_intel_notes (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  author text check (author in ('agency', 'client')) default 'agency',
  note text not null,
  created_at timestamptz default now()
);

alter table public.client_intel_notes enable row level security;
create policy "Agency admins manage intel notes"
  on public.client_intel_notes for all
  using (auth.role() = 'authenticated');

-- ================================================
-- SOCIAL ACCOUNTS (OAuth tokens per platform)
-- ================================================
create table public.social_accounts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  platform text check (platform in ('facebook', 'instagram', 'linkedin', 'tiktok', 'youtube')) not null,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  account_name text not null,
  account_id text not null,
  created_at timestamptz default now(),
  unique(workspace_id, platform, account_id)
);

alter table public.social_accounts enable row level security;
create policy "Agency admins manage social accounts"
  on public.social_accounts for all
  using (auth.role() = 'authenticated');

-- ================================================
-- POSTS
-- ================================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  content text not null,
  media_urls text[],
  platforms text[] not null,
  scheduled_at timestamptz,
  status text check (status in ('draft','pending_approval','approved','scheduled','publishing','published','failed')) default 'draft',
  approval_token text unique,
  qstash_message_id text,
  last_error text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.posts enable row level security;
create policy "Agency admins manage posts"
  on public.posts for all
  using (auth.role() = 'authenticated');

-- ================================================
-- POST RESULTS (analytics after publishing)
-- ================================================
create table public.post_results (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  platform text not null,
  platform_post_id text,
  impressions int,
  reach int,
  likes int,
  comments int,
  shares int,
  saved int,
  fetched_at timestamptz default now()
);

alter table public.post_results enable row level security;
create policy "Agency admins view post results"
  on public.post_results for all
  using (auth.role() = 'authenticated');

-- ================================================
-- MEDIA LIBRARY
-- ================================================
create table public.media (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  file_url text not null,
  file_type text not null,
  tags text[],
  created_at timestamptz default now()
);

alter table public.media enable row level security;
create policy "Agency admins manage media"
  on public.media for all
  using (auth.role() = 'authenticated');

-- ================================================
-- WORKSPACE API KEYS (for cross-project triggers)
-- ================================================
create table public.workspace_api_keys (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  key_hash text not null unique,
  label text not null,
  last_used_at timestamptz,
  created_at timestamptz default now(),
  revoked_at timestamptz
);

alter table public.workspace_api_keys enable row level security;
create policy "Agency admins manage API keys"
  on public.workspace_api_keys for all
  using (auth.role() = 'authenticated');

-- ================================================
-- BRAND KITS (visual identity per client)
-- ================================================
create table public.brand_kits (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  logo_url text,
  primary_color text default '#f97316',
  secondary_color text default '#1a1a27',
  accent_color text default '#fbbf24',
  font_preference text default 'Inter',
  watermark_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id)
);

alter table public.brand_kits enable row level security;
create policy "Agency admins manage brand kits"
  on public.brand_kits for all
  using (auth.role() = 'authenticated');

-- ================================================
-- Indexes for performance
-- ================================================
create index brand_kits_workspace_id_idx on public.brand_kits(workspace_id);
create index posts_workspace_id_idx on public.posts(workspace_id);
create index posts_status_idx on public.posts(status);
create index posts_scheduled_at_idx on public.posts(scheduled_at);
create index posts_approval_token_idx on public.posts(approval_token);
create index social_accounts_workspace_id_idx on public.social_accounts(workspace_id);
create index post_results_post_id_idx on public.post_results(post_id);
create index media_workspace_id_idx on public.media(workspace_id);
create index workspace_api_keys_key_hash_idx on public.workspace_api_keys(key_hash);
