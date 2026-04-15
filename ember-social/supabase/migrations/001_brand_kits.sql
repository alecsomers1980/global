-- ================================================
-- Migration: Add brand_kits table
-- Run this in your Supabase SQL Editor
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

create index brand_kits_workspace_id_idx on public.brand_kits(workspace_id);
