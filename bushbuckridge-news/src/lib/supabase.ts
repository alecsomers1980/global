import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oxkyxgrmsqoyqotrskga.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94a3l4Z3Jtc3FveXFvdHJza2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzUyNzQsImV4cCI6MjA4Nzk1MTI3NH0.fYEfOa2entRi_mR3EGtVfwupLROtPVvpoH9nVjOXakI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility helper to get the public URL of an image stored in our "media" bucket
export function getImageUrl(path: string | null) {
    if (!path) return '/placeholder-news.jpg'; // Fallback generic image

    // If it's already a full URL (e.g. from an old DB), return as is
    if (path.startsWith('http')) return path;

    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
}
