-- 020: track when a video job actually starts processing (first Seedance
-- submit), separate from posts.created_at (when the row was inserted at
-- plan-generation time). The stuck-job cutoff in /api/cron/generate-videos
-- must measure from processing start, not queue-insertion time — a batch of
-- 3 video jobs drains sequentially at ~1 per cron tick, so later jobs in the
-- same batch (or across multiple batches generated back-to-back) can have a
-- created_at far earlier than when they actually began rendering.

alter table public.posts
  add column if not exists video_started_at timestamptz;
