-- ================================================
-- Migration: News articles control plane
-- Ember-Social stores & approves articles, then
-- pushes approved ones into each client's own
-- Supabase news_posts table.
-- Run this in the Ember-Social Supabase SQL editor.
-- ================================================

-- 1. Per-workspace client site credentials so Ember-Social can push into
--    the client's own Supabase (news_posts table). Service role is sensitive.
alter table public.workspaces
    add column if not exists client_supabase_url text,
    add column if not exists client_supabase_service_key text,
    add column if not exists client_site_url text,
    add column if not exists client_news_table text default 'news_posts';

-- 2. Articles authored in the control plane
create table if not exists public.news_articles (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    category text not null check (category in ('buying-guide','local','model-review')),
    title text not null,
    slug text not null,
    excerpt text,
    meta_title text,
    meta_description text,
    body_md text not null default '',
    hero_image_url text,
    featured_vehicle_id text,
    status text not null default 'draft'
        check (status in ('draft','pending_approval','approved','published','archived')),
    remote_post_id text,        -- id of the row created on the client's news_posts
    remote_synced_at timestamptz,
    published_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(workspace_id, slug)
);

create index if not exists news_articles_workspace_status_idx
    on public.news_articles(workspace_id, status, created_at desc);
create index if not exists news_articles_category_idx
    on public.news_articles(workspace_id, category);

create or replace function public.news_articles_touch_updated()
returns trigger language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists news_articles_touch on public.news_articles;
create trigger news_articles_touch
before update on public.news_articles
for each row execute function public.news_articles_touch_updated();

alter table public.news_articles enable row level security;
create policy "Agency admins manage news articles"
    on public.news_articles for all
    using (auth.role() = 'authenticated');
