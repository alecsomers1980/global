'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ViewBeacon({ slug, siteId }: { slug: string; siteId: string }) {
  useEffect(() => {
    const key = `viewed:${siteId}:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    supabase.rpc('increment_view_count', { p_slug: slug, p_site_id: siteId });
  }, [slug, siteId]);

  return null;
}