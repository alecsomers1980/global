-- Migration to add cost column to events table
ALTER TABLE events ADD COLUMN cost VARCHAR(100) DEFAULT 'Free';

-- Update existing events with some example costs if they exist
-- This is just for demonstration/initial data
UPDATE events SET cost = 'Free' WHERE cost IS NULL;
