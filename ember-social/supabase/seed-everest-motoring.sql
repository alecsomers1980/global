-- ================================================
-- Seed: Connect Everest Motoring to Ember Social
-- Run this in your Supabase SQL Editor
-- ================================================

DO $$
DECLARE
  ws_id uuid;
BEGIN
  -- 1. Create the Everest Motoring workspace (let Postgres generate the UUID)
  INSERT INTO public.workspaces (name, slug)
  VALUES ('Everest Motoring', 'everest-motoring')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO ws_id;

  -- 2. Create client intelligence (the AI brain)
  INSERT INTO public.client_intelligence (
    workspace_id,
    industry,
    target_audience,
    brand_voice,
    goals,
    current_month_focus,
    key_messages,
    do_not_post,
    learned_preferences
  )
  VALUES (
    ws_id,

    'Premium Pre-Owned Vehicle Dealership',

    'South African car buyers (primary: Mpumalanga, secondary: national). Middle to upper-income individuals who value transparency, verified quality, and integrity over the lowest price. Trade-in customers looking to upgrade. Buyers who have been burned by dishonest dealers and want a trustworthy experience.',

    'Professional, confident, and transparent. Speaks with authority earned through 35+ years in the automotive industry. Warm but never salesy — the quality speaks for itself. Uses phrases like "The Everest Way" to reinforce brand identity. Tone is reassuring, premium, and direct. Afrikaans-friendly but primarily English.',

    'Lead generation for premium pre-owned vehicle sales. Build brand awareness as South Africa''s most transparent dealership. Drive test drive bookings and finance applications. Grow the affiliate network for wider vehicle distribution.',

    'Showcase new arrivals with AI cinematic videos. Push finance pre-approval as a frictionless entry point. Highlight the 100-point inspection process to build trust. Promote national delivery capability.',

    ARRAY[
      'Every vehicle passes a 100-point independent inspection',
      'Zero tolerance for accident-damaged or rebuilt vehicles',
      'Verified mileage with full franchise service history',
      'In-house financing through all major SA banks',
      'National delivery available across South Africa',
      'Quality isn''t just a promise — it''s a guaranteed standard',
      'Founded by Christo Pieterse with 35+ years in automotive'
    ],

    ARRAY[
      'Never disparage competitor dealerships by name',
      'Never make guarantees about specific finance approval rates or terms',
      'Never post vehicles that have not completed the full inspection process',
      'No political or religious content',
      'Never use high-pressure sales language like "limited time" or "act now"',
      'Never post unverified mileage or specs',
      'Do not use stock photos — only real vehicle photos and AI-generated videos from actual inventory'
    ],

    '{}'::jsonb
  )
  ON CONFLICT (workspace_id) DO UPDATE SET
    industry = EXCLUDED.industry,
    target_audience = EXCLUDED.target_audience,
    brand_voice = EXCLUDED.brand_voice,
    goals = EXCLUDED.goals,
    current_month_focus = EXCLUDED.current_month_focus,
    key_messages = EXCLUDED.key_messages,
    do_not_post = EXCLUDED.do_not_post,
    last_updated_at = now();

  -- 3. Register the API key used by everest-motoring
  -- Key: es_d22f629e08bebb7c928503575db2e41aded8dc62fe1a400d
  -- SHA-256 hash of the above key:
  INSERT INTO public.workspace_api_keys (workspace_id, key_hash, label)
  VALUES (
    ws_id,
    'ed75688a453540faec1bb01748c66d4c2de2f0cc87ee3ba3169ae828e055fad1',
    'Everest Motoring Admin Panel'
  )
  ON CONFLICT (key_hash) DO NOTHING;

  -- 4. Create brand kit (Everest Motoring visual identity)
  INSERT INTO public.brand_kits (workspace_id, logo_url, primary_color, secondary_color, accent_color, font_preference)
  VALUES (
    ws_id,
    null,
    '#d32f2f',
    '#1a237e',
    '#fbbf24',
    'Montserrat'
  )
  ON CONFLICT (workspace_id) DO UPDATE SET
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    accent_color = EXCLUDED.accent_color,
    font_preference = EXCLUDED.font_preference,
    updated_at = now();

  RAISE NOTICE 'Everest Motoring workspace created with id: %', ws_id;
END $$;

-- Verify the setup
SELECT
  w.name AS workspace,
  w.slug,
  ci.industry,
  ci.brand_voice IS NOT NULL AS has_brand_voice,
  ci.key_messages IS NOT NULL AS has_key_messages,
  ci.do_not_post IS NOT NULL AS has_do_not_post,
  ak.label AS api_key_label,
  ak.key_hash IS NOT NULL AS key_registered,
  bk.primary_color,
  bk.font_preference,
  bk.id IS NOT NULL AS has_brand_kit
FROM public.workspaces w
LEFT JOIN public.client_intelligence ci ON ci.workspace_id = w.id
LEFT JOIN public.workspace_api_keys ak ON ak.workspace_id = w.id
LEFT JOIN public.brand_kits bk ON bk.workspace_id = w.id
WHERE w.slug = 'everest-motoring';
