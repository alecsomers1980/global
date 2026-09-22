-- Adds the basic "upload a PDF" path for newsletters, alongside the existing
-- section-based rich editor. pdf_url is nullable: existing rich newsletters
-- are untouched, new ones can set it to skip the section editor entirely.
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS pdf_url TEXT;
