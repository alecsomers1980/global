-- ====================================================================
-- GALLERY SYSTEM UPGRADE: CATEGORIES, ALBUMS, AND IMAGES
-- ====================================================================

-- 1. Create Gallery Categories Table
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Gallery Albums Table (if it exists, otherwise create it)
-- We check if 'category_id' exists, if not we add it. 
-- For a fresh start, we'll recreate it carefully.
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES gallery_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_date DATE,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns safely if they don't exist
DO $$ 
BEGIN 
  -- 1. Ensure cover_image_url exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_albums' AND column_name='cover_image_url') THEN
    -- If 'cover_image' (old name) exists, rename it.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_albums' AND column_name='cover_image') THEN
      ALTER TABLE gallery_albums RENAME COLUMN cover_image TO cover_image_url;
    ELSE
      -- Otherwise, just create the new column.
      ALTER TABLE gallery_albums ADD COLUMN cover_image_url TEXT;
    END IF;
  ELSE
    -- If cover_image_url already exists AND cover_image still exists, 
    -- we should migrate any data from old to new and then drop the old.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_albums' AND column_name='cover_image') THEN
      UPDATE gallery_albums SET cover_image_url = cover_image WHERE cover_image_url IS NULL;
      ALTER TABLE gallery_albums DROP COLUMN cover_image;
    END IF;
  END IF;

  -- 2. Ensure category_id exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_albums' AND column_name='category_id') THEN
    ALTER TABLE gallery_albums ADD COLUMN category_id UUID REFERENCES gallery_categories(id) ON DELETE CASCADE;
  END IF;

  -- 3. Ensure slug exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_albums' AND column_name='slug') THEN
    ALTER TABLE gallery_albums ADD COLUMN slug TEXT UNIQUE;
    -- Populate slug from name for existing rows
    UPDATE gallery_albums SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
    -- Make it NOT NULL after population if you want, but sticking to safe migration for now.
  END IF;

END $$;

-- 3. Create Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert Default Categories
INSERT INTO gallery_categories (name, slug, description, sort_order)
VALUES 
  ('Sport', 'sport', 'Action shots and highlights from our athletics, swimming, and team sports.', 1),
  ('Culture', 'culture', 'Celebrating our choir, drama productions, and artistic achievements.', 2),
  ('School Life', 'school-life', 'Daily moments, classroom activities, and life on campus.', 3),
  ('Events', 'events', 'Special occasions, fundraisers, and community gatherings.', 4)
ON CONFLICT (slug) DO NOTHING;
