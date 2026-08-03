CREATE TABLE insights_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  meta_title text,
  meta_description text,
  content text NOT NULL,
  category text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'PUBLISHED', 'DISCARDED')),
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now(),
  published_at timestamptz
);

ALTER TABLE insights_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON insights_posts
  FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Authenticated users can select posts" ON insights_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert posts" ON insights_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update posts" ON insights_posts
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete posts" ON insights_posts
  FOR DELETE USING (auth.uid() IS NOT NULL);

INSERT INTO storage.buckets (id, name, public)
VALUES ('insight_images', 'insight_images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view insight images" ON storage.objects
  FOR SELECT USING (bucket_id = 'insight_images');

CREATE POLICY "Authenticated users can insert insight images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'insight_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update insight images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'insight_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete insight images" ON storage.objects
  FOR DELETE USING (bucket_id = 'insight_images' AND auth.uid() IS NOT NULL);
