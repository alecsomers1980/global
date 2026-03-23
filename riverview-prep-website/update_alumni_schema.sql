-- Add image_url to alumni table
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies (just in case)
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- Ensure all operations are allowed (patterns from migration.sql)
DROP POLICY IF EXISTS "Allow all select" ON alumni;
CREATE POLICY "Allow all select" ON alumni FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON alumni;
CREATE POLICY "Allow all insert" ON alumni FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON alumni;
CREATE POLICY "Allow all update" ON alumni FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all delete" ON alumni;
CREATE POLICY "Allow all delete" ON alumni FOR DELETE USING (true);
