import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { pickNextCategory, generateInsight } from '@/utils/ai/insightsGenerator';
import { sendAdminNotification } from '@/lib/email';

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch the recent 12 post titles
    const { data: recentPosts, error: fetchError } = await supabase
      .from('insights_posts')
      .select('title')
      .order('created_at', { ascending: false })
      .limit(12);

    if (fetchError) {
      throw fetchError;
    }

    const recentTitles = recentPosts?.map((post: { title: string }) => post.title) ?? [];

    // Determine current month's 7th and 21st dates
    const now = new Date();
    const seventhDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 7, 6, 0, 0));
    const twentyFirstDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 21, 6, 0, 0));

    // Generate first insight scheduled for the 7th
    const category1 = pickNextCategory(recentTitles as any);
    const insight1 = await generateInsight({ category: category1, recentTitles });

    // Generate second insight scheduled for the 21st
    // Include the first generated title to diversify category selection
    const category2 = pickNextCategory([...recentTitles, insight1.title] as any);
    const insight2 = await generateInsight({ category: category2, recentTitles: [...recentTitles, insight1.title] });

    // Save both generated posts as DRAFT
    const { error: insertError } = await supabase
      .from('insights_posts')
      .insert([
        {
          title: insight1.title,
          slug: insight1.slug,
          excerpt: insight1.excerpt,
          meta_title: insight1.meta_title,
          meta_description: insight1.meta_description,
          content: insight1.body_md,
          image_url: insight1.image_url,
          category: category1,
          status: 'DRAFT',
          scheduled_for: seventhDate.toISOString(),
        },
        {
          title: insight2.title,
          slug: insight2.slug,
          excerpt: insight2.excerpt,
          meta_title: insight2.meta_title,
          meta_description: insight2.meta_description,
          content: insight2.body_md,
          image_url: insight2.image_url,
          category: category2,
          status: 'DRAFT',
          scheduled_for: twentyFirstDate.toISOString(),
        },
      ]);

    if (insertError) {
      throw insertError;
    }

    // Notify admin that new insights are awaiting review
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@rvrinc.co.za';
    if (sendAdminNotification) {
        await sendAdminNotification({
            recipientEmail: adminEmail,
            subject: '2 New Insights Generated — Awaiting Review',
            message: 'Two new insights posts have been generated and are currently in DRAFT status, awaiting your review in the admin portal.\n\nPlease log in to review and approve them for scheduling on the 7th and 21st of the month.'
        }).catch(err => console.error("Email failed:", err));
    }

    return NextResponse.json({
      success: true,
      generated: 2,
      scheduled_for: [seventhDate.toISOString(), twentyFirstDate.toISOString()],
    });
  } catch (error: any) {
    console.error('[generate-insights] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', message: error?.message },
      { status: 500 }
    );
  }
}
