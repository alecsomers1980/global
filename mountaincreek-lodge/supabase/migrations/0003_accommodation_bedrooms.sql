ALTER TABLE accommodation_units ADD COLUMN IF NOT EXISTS bedrooms integer;

UPDATE accommodation_units
SET bedrooms = CEIL(sleeps / 2.0)::integer
WHERE bedrooms IS NULL;

ALTER TABLE accommodation_units
    ALTER COLUMN bedrooms SET NOT NULL,
    ALTER COLUMN bedrooms SET DEFAULT 1;
