ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.post_categories (
    post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS wp_term_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS categories_site_slug_idx
    ON public.categories (site_id, slug);

CREATE INDEX IF NOT EXISTS posts_site_status_published_idx
    ON public.posts (site_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_site_slug_idx
    ON public.posts (site_id, slug);
CREATE INDEX IF NOT EXISTS post_categories_category_idx
    ON public.post_categories (category_id);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view post categories" ON public.post_categories;
CREATE POLICY "Public can view post categories" ON public.post_categories
    FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.increment_view_count(p_slug TEXT, p_site_id TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.posts
       SET view_count = view_count + 1
     WHERE slug = p_slug AND site_id = p_site_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_view_count(TEXT, TEXT) TO anon;

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email      TEXT NOT NULL,
    site_id    TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (site_id, email)
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);