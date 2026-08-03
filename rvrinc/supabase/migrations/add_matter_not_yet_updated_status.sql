-- =============================================
-- Add "Matter not yet updated" as default status (sort_order 0)
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. BACKUP: snapshot current case statuses before any changes
CREATE TABLE IF NOT EXISTS public.cases_status_backup_20260617 AS
SELECT id, case_number, title, status, status_phase, updated_at
FROM public.cases;

-- 2. Add the new status at sort_order 0 (before all existing statuses)
INSERT INTO public.case_statuses (slug, label, phase, sort_order, default_note, requires_note, requires_date, requires_client_action, client_message)
VALUES (
  'matter_not_yet_updated',
  'Matter not yet updated',
  'intake',
  0,
  NULL,
  false,
  false,
  false,
  'Matter not yet updated'
)
ON CONFLICT (slug) DO UPDATE SET
  label       = EXCLUDED.label,
  sort_order  = EXCLUDED.sort_order;

-- 3. Set the column default for new cases
ALTER TABLE public.cases ALTER COLUMN status SET DEFAULT 'matter_not_yet_updated';

-- 4. Update cases that have NOT been updated yet.
--    Criteria (any one is sufficient):
--      a) status IS NULL — was never set
--      b) status is a legacy value not present in case_statuses (e.g. 'open')
--      c) status = 'consultation_complete' AND the case has zero entries in
--         case_status_history — meaning it was created with the old default
--         and nobody has ever manually updated it (no log = untouched)
UPDATE public.cases
SET
  status       = 'matter_not_yet_updated',
  status_phase = 'intake',
  updated_at   = updated_at  -- preserve original updated_at; do not bump it
WHERE
  status IS NULL
  OR status NOT IN (SELECT slug FROM public.case_statuses)
  OR (
    status = 'consultation_complete'
    AND id NOT IN (SELECT DISTINCT case_id FROM public.case_status_history)
  );
