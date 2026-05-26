alter table public.post_results alter column fetched_at drop default;
alter table public.post_results alter column fetched_at drop not null;
create unique index if not exists post_results_post_platform_idx on public.post_results(post_id, platform);
