-- Add slug column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing events to have a slug (fallback to ID if title is empty)
UPDATE events SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- Make slug required for future inserts
-- ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
