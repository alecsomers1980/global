-- Diana's Bulbinella — Phase D: automated blog / journal
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Lifecycle mirrors the rvrinc/aloe pattern:
--   generate-blog cron  → inserts 'draft' rows scheduled_for a future date
--   Diana reviews in /admin/blog, edits copy, then 'approved'
--   publish-blog cron   → flips 'approved' rows whose scheduled_for <= now() to 'published'
-- Drafts are written by the cron with the service-role client (bypasses RLS);
-- Diana's edits/approvals go through the staff session (is_staff()).
-- The public can only SELECT 'published' rows.
--
-- COMPLIANCE: the generator prompt enforces docs/compliance-rules.md (no medical
-- claims). Diana's manual approval is the mandatory second gate before anything
-- health-related goes live — nothing publishes without it.

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text not null default '',
  meta_title       text not null default '',
  meta_description text not null default '',
  content          text not null,                 -- GitHub-flavoured markdown
  category         text not null,
  image_url        text not null default '',      -- path under /public or absolute URL
  status           text not null default 'draft'
                     check (status in ('draft','approved','published','discarded')),
  scheduled_for    timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  published_at     timestamptz
);
create index if not exists blog_posts_status_idx       on public.blog_posts (status);
create index if not exists blog_posts_published_at_idx  on public.blog_posts (published_at desc);
create index if not exists blog_posts_schedule_idx      on public.blog_posts (status, scheduled_for);

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- ─────────────────────────── RLS ───────────────────────────
alter table public.blog_posts enable row level security;

-- Public reads published posts; staff read every status (for the admin queue).
drop policy if exists "read published posts" on public.blog_posts;
create policy "read published posts" on public.blog_posts
  for select using (status = 'published' or public.is_staff());

-- Staff edit / approve / discard. Draft inserts come from the cron (service-role).
drop policy if exists "staff write posts" on public.blog_posts;
create policy "staff write posts" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());
