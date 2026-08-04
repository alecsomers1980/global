-- Supabase Schema Setup for News Platform

-- 1. Create the posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wp_id BIGINT UNIQUE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    featured_image TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'publish',
    is_top_story BOOLEAN DEFAULT false,
    site_id TEXT DEFAULT 'bushbuckridge-news',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    site_id TEXT DEFAULT 'bushbuckridge-news',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create advertisements table (for the "Advertise With Us" portal)
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    target_link TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT false,
    payment_status TEXT DEFAULT 'pending',
    site_id TEXT DEFAULT 'bushbuckridge-news',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS but allow public reads
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON public.posts
    FOR SELECT USING (status = 'publish' OR status = 'publish ');

CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view active ads" ON public.advertisements
    FOR SELECT USING (is_active = true);

-- Note: Service Role key bypasses RLS for inserting and updating.

-- 5. Create storage bucket for media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read media" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
