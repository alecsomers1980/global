-- Add last_error to posts so platform publish failures (e.g. Facebook Graph
-- API rejections) are persisted rather than only logged to console.
-- Cleared at the start of every publish attempt and on success;
-- populated when any platform fails.

alter table public.posts
  add column if not exists last_error text;
