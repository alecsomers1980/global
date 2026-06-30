-- Per-post click and video-view metrics.
-- Facebook's post_clicks and post_video_views insights survived the 2026-06-15
-- deprecation that removed post_impressions/reach. fetchEngagement now collects
-- them; these nullable columns hold the values (null when a platform/post type
-- doesn't expose them — e.g. photo posts have 0 video_views, IG exposes neither).

alter table public.post_results
  add column if not exists clicks integer,
  add column if not exists video_views integer;
