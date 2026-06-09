# A1 — Apply migration 005 to production Supabase

**Type**: Manual SQL — not a DeepSeek task. The user runs this directly.

## Why

Migration `supabase/migrations/005_posts_last_error.sql` adds the `last_error` column to `posts`. The publish flow already writes to this column (`src/lib/publish.ts` and `src/app/api/cron/publish-scheduled/route.ts`). If the column doesn't exist in production, every UPDATE that includes `last_error` fails — the post stays stuck in `publishing` and the cron skips it on the next run because it only picks `approved`. This is the most likely root cause of the missed Everest auto-post.

## What to run

In Supabase Dashboard → SQL Editor → New Query, paste and run:

```sql
alter table public.posts
  add column if not exists last_error text;
```

The `if not exists` clause makes this safe to run even if it's somehow already applied.

## How to verify

After running:

1. In Supabase → Table Editor → `posts` → confirm a `last_error` column appears (text, nullable).
2. Trigger a post from Everest, approve it, wait for the next cron tick (max 5 min), watch the row in `posts`. If publish succeeds, `status` flips to `published` and `last_error` is `null`. If it fails, `last_error` now contains the actual error message instead of leaving the post stuck.

## After completion

Mark **A1** as `[x]` in [`README.md`](./README.md). Don't proceed to A2 until you've confirmed the next Everest post publishes end-to-end.
