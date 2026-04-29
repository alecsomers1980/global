import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { imageUrl } = await req.json();
    if (!imageUrl || !imageUrl.includes('/images/')) {
      return NextResponse.json({ success: true });
    }

    const parts = imageUrl.split('/images/');
    if (parts.length < 2) return NextResponse.json({ success: true });
    
    const filePath = parts[1].split('?')[0];
    
    const { error } = await supabase.storage.from('images').remove([filePath]);
    if (error) {
       console.error("Error deleting image:", error);
       return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
