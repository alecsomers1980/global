import { supabase } from './supabase';

export function getImageUrl(path: string | null) {
  if (!path) return '/placeholder-news.jpg';
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
