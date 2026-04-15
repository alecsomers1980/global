-- ====================================================================
-- SEED DATA: GALLERY SYSTEM DEMONSTRATION
-- ====================================================================

-- 1. Ensure Categories exist (already in migration, but let's be safe)
INSERT INTO gallery_categories (name, slug, description, sort_order)
VALUES 
  ('Sport', 'sport', 'Highlights from the field, court, and pool.', 1),
  ('Culture', 'culture', 'Drama, music, and artistic achievements.', 2),
  ('School Life', 'school-life', 'Daily moments and campus activities.', 3),
  ('Events', 'events', 'Community gatherings and special occasions.', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert dummy albums
-- We use a subquery to get the category IDs
WITH cats AS (SELECT id, slug FROM gallery_categories)
INSERT INTO gallery_albums (id, category_id, name, slug, description, cover_image_url, event_date)
VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    (SELECT id FROM cats WHERE slug = 'sport'), 
    'Inter-School Athletics 2026', 
    'athletics-2026', 
    'A day of determination and teamwork at the MJ Zwane Athletics meet.', 
    '/images/hero-bg.jpg', 
    '2026-02-28'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    (SELECT id FROM cats WHERE slug = 'culture'), 
    'Oliver with a Twist Rehearsals', 
    'oliver-rehearsals', 
    'Behind the scenes of our upcoming major production.', 
    '/images/hero-bg.jpg', 
    '2026-03-01'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    (SELECT id FROM cats WHERE slug = 'school-life'), 
    'Grade 1 First Day', 
    'grade-1-first-day', 
    'Welcoming our newest Cubs to the Riverview family.', 
    '/images/hero-bg.jpg', 
    '2026-01-15'
  );

-- 3. Insert some dummy images for one album
INSERT INTO gallery_images (album_id, image_url, caption, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', '/images/hero-bg.jpg', 'Sprint finishing line', 0),
  ('11111111-1111-1111-1111-111111111111', '/images/hero-bg.jpg', 'Team cheer', 1),
  ('11111111-1111-1111-1111-111111111111', '/images/hero-bg.jpg', 'Medal ceremony', 2);
