-- 019: video job tracking columns, mirrors the image_status pattern in 009.
-- Lets /api/cron/generate-videos advance a Seedance render across multiple
-- cron ticks (a single render can poll for up to 12 minutes).

alter table public.posts
  add column if not exists video_status text
    check (video_status in ('pending','generating','rendering','compositing','ready','failed')),
  add column if not exists video_concept text,
  add column if not exists video_task_id text,
  add column if not exists video_prompt text;
