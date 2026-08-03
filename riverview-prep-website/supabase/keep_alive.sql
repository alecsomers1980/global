-- Keep-alive table for the GitHub Actions inactivity-pause preventer.
-- Run this ONCE in the Supabase SQL Editor for this project.
-- The scheduled workflow inserts one row here twice a week so the
-- Free-plan project registers user DB activity and is never paused.
create table if not exists public.keep_alive (
  id bigint generated always as identity primary key,
  note text,
  created_at timestamptz default now()
);
