-- 0006 — Insights (AI-generated articles / blog) for SEO + GEO.
-- Mirrors the rvrinc insights system, adapted to the hslabour service-role pattern:
-- RLS is enabled with NO policies; all access is via service-role server code
-- (createAdminClient), and public pages query with status = 'PUBLISHED'.
-- Re-runnable.

create table if not exists public.insights_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  meta_title text,
  meta_description text,
  content text not null,                              -- GitHub-flavoured markdown
  category text not null,
  image_url text,
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'APPROVED', 'PUBLISHED', 'DISCARDED')),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists insights_posts_status_idx on public.insights_posts(status);
create index if not exists insights_posts_published_idx on public.insights_posts(published_at desc);

alter table public.insights_posts enable row level security;
-- Intentionally NO policies — service-role server code only (same as shop/ebook).

-- Public bucket for AI-generated hero images (public read works without a policy
-- because the bucket itself is public; uploads happen via service-role).
insert into storage.buckets (id, name, public) values ('insight_images', 'insight_images', true)
  on conflict (id) do nothing;
