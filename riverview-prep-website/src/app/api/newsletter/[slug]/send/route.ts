import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { Resend } from 'resend';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createServerSupabase();
  const slug = params.slug;

  // Verify admin session
  const cookieStore = request.cookies;
  const session = cookieStore.get('admin-session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch newsletter
  const { data: newsletter, error: nlErr } = await supabase
    .from('newsletters')
    .select('*')
    .eq('slug', slug)
    .single();

  if (nlErr || !newsletter) {
    return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
  }

  // Fetch sections
  const { data: sections } = await supabase
    .from('newsletter_sections')
    .select('*')
    .eq('newsletter_id', newsletter.id)
    .order('sort_order', { ascending: true });

  // Fetch active subscribers
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email, full_name')
    .eq('is_active', true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
  }

  // Generate email HTML (same logic as the email preview route)
  const formattedDate = new Date(newsletter.publish_date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const highlights = Array.isArray(newsletter.highlights) ? newsletter.highlights : [];

  const colors = {
    green: '#164e24', gold: '#c4a459', bg: '#fcfdfe',
    text: '#1a2e1d', textMuted: '#475569',
  };

  function renderParagraphs(text: string) {
    if (!text) return '';
    return text.split('\n\n').filter(Boolean).map(p =>
      `<p style="margin-bottom: 20px; font-size: 16px; line-height: 1.6; color: ${colors.textMuted};">${p.replace(/\n/g, '<br/>')}</p>`
    ).join('');
  }

  let sectionsHtml = '';
  (sections || []).forEach(sec => {
    const sType = sec.section_type || 'content';
    const ex = sec.extra_data || {};
    if (sType !== 'event' && sType !== 'achievement') {
      sectionsHtml += `<tr><td style="padding: 40px 0 20px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="30" valign="middle"><div style="width: 6px; height: 6px; background-color: ${colors.gold}; border-radius: 50%;"></div></td><td valign="middle"><h3 style="margin: 0; color: ${colors.green}; font-size: 22px; font-family: 'Courier New', monospace; font-weight: bold; text-transform: uppercase;">${sec.title}</h3></td></tr></table></td></tr>`;
    }
    if (sType === 'content' || sType === 'sport' || sType === 'culture' || sType === 'academic' || sType === 'head') {
      const gallery: string[] = ex.gallery || (sec.image_url ? [sec.image_url] : []);
      let imagesHtml = '';
      if (gallery.length > 0) {
        imagesHtml = gallery.map(img => `<tr><td style="padding: 10px 0 20px;"><img src="${img}" width="600" style="max-width: 100%; display: block; border-radius: 16px;" alt="${sec.title}" /></td></tr>`).join('');
      }
      sectionsHtml += `${imagesHtml}<tr><td style="padding-bottom: 20px;">${renderParagraphs(sec.body)}</td></tr>`;
    }
  });

  const emailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${newsletter.title}</title></head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
<tr><td style="background-color: ${colors.green}; padding: 40px; text-align: center;">
<p style="margin: 0 0 10px; color: ${colors.gold}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">${newsletter.term} | ${newsletter.issue_number} | ${formattedDate}</p>
<h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; line-height: 1.2;">${newsletter.headline || newsletter.title}</h1>
</td></tr>
${highlights.length > 0 ? `<tr><td style="background-color: #1a5c2b; padding: 15px 40px; text-align: center;"><p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">${highlights.join(' &nbsp;|&nbsp; ')}</p></td></tr>` : ''}
<tr><td style="padding: 20px 40px 40px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">${sectionsHtml}</table></td></tr>
<tr><td style="background-color: #f8fafc; padding: 40px; border-top: 1px solid #e2e8f0; text-align: center;">
<p style="margin: 0 0 10px; color: ${colors.textMuted}; font-size: 14px; font-weight: bold;">Riverview Preparatory School</p>
<p style="margin: 0 0 20px; color: #94a3b8; font-size: 12px;">Malelane, Mpumalanga, South Africa</p>
</td></tr></table>
<table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;"><tr><td align="center">
<p style="margin: 0; font-size: 11px; color: #94a3b8;">You are receiving this email because you subscribed to the Riverview Reporter.<br/><a href="https://riverviewprep.org/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a></p>
</td></tr></table></td></tr></table></body></html>`;

  // Send via Resend (BCC all subscribers)
  const resend = new Resend(process.env.RESEND_API_KEY);
  const bccList = subscribers.map((s: { email: string }) => s.email);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Riverview Preparatory School <newsletter@riverviewprep.org>',
      to: 'Riverview Preparatory School <info@riverviewprep.org>',
      bcc: bccList,
      subject: `${newsletter.title} — Riverview Reporter`,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sent_to: bccList.length,
      id: data?.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send' }, { status: 500 });
  }
}
