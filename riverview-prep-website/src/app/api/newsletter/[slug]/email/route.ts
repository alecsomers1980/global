import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createServerSupabase();
  const slug = params.slug;

  const { data: newsletter, error: nlErr } = await supabase
    .from("newsletters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (nlErr || !newsletter) {
    return new NextResponse('Newsletter not found', { status: 404 });
  }

  const { data: sections } = await supabase
    .from("newsletter_sections")
    .select("*")
    .eq("newsletter_id", newsletter.id)
    .order("sort_order", { ascending: true });

  const formattedDate = new Date(newsletter.publish_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' });
  const highlights = Array.isArray(newsletter.highlights) ? newsletter.highlights : [];

  // ==========================================
  // HTML EMAIL GENERATION (TABLE BASED)
  // ==========================================
  
  const colors = {
    green: '#164e24',
    gold: '#c4a459',
    bg: '#fcfdfe',
    text: '#1a2e1d',
    textMuted: '#475569',
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
    
    // Default Title Block
    if (sType !== 'event' && sType !== 'achievement') {
        sectionsHtml += `
          <!-- Section Title -->
          <tr>
            <td style="padding: 40px 0 20px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="30" valign="middle">
                    <div style="width: 6px; height: 6px; background-color: ${colors.gold}; border-radius: 50%;"></div>
                  </td>
                  <td valign="middle">
                    <h3 style="margin: 0; color: ${colors.green}; font-size: 22px; font-family: 'Courier New', monospace; font-weight: bold; text-transform: uppercase;">
                      ${sec.title}
                    </h3>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
    }

    // Achievement Block
    if (sType === 'achievement') {
      sectionsHtml += `
        <tr>
          <td style="padding: 30px 0;">
            <table width="100%" cellpadding="30" cellspacing="0" border="0" style="background-color: ${colors.green}; border-radius: 20px;">
              <tr>
                <td>
                  <p style="margin: 0 0 10px; color: ${colors.gold}; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">★ Achievement</p>
                  <h4 style="margin: 0 0 5px; color: #ffffff; font-size: 24px;">${sec.title}</h4>
                  <p style="margin: 0 0 20px; color: ${colors.gold}; font-size: 18px; font-weight: bold;">${ex.athlete}</p>
                  <div style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">${renderParagraphs(sec.body)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }
    // Event Block
    else if (sType === 'event') {
      sectionsHtml += `
        <tr>
          <td style="padding: 30px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
              ${sec.image_url ? `
                <tr>
                  <td>
                    <img src="${sec.image_url}" width="600" style="max-width: 100%; display: block; border: 0;" alt="Event cover" />
                  </td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 40px;">
                  <span style="background-color: ${colors.gold}; color: #ffffff; padding: 4px 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 50px; display: inline-block; margin-bottom: 15px;">Event Spotlight</span>
                  <h3 style="margin: 0 0 10px; color: ${colors.green}; font-size: 28px;">${sec.title}</h3>
                  <p style="margin: 0 0 20px; color: ${colors.gold}; font-size: 18px; font-style: italic; font-family: serif;">${ex.subtitle || ''}</p>
                  <p style="margin: 0 0 30px; color: ${colors.textMuted}; font-size: 16px; line-height: 1.6;">${sec.body}</p>
                  ${ex.ctaHref ? `
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background-color: ${colors.green}; border-radius: 50px;">
                          <a href="https://riverviewprep.edu${ex.ctaHref}" target="_blank" style="display: inline-block; padding: 14px 30px; font-family: sans-serif; font-size: 14px; color: #ffffff; text-decoration: none; font-weight: bold;">View Details &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }
    // Dates List
    else if (sType === 'dates') {
      const datesListStr = (ex.items || []).map((item: any) => `
        <tr>
          <td width="100" valign="top" style="padding-bottom: 20px;">
            <table width="80" cellpadding="10" cellspacing="0" border="0" style="background-color: ${colors.green}; border-radius: 12px;">
              <tr>
                <td align="center" style="color: #ffffff; font-size: 11px; font-weight: bold;">
                  ${item.date}
                </td>
              </tr>
            </table>
          </td>
          <td valign="top" style="padding-bottom: 20px; padding-left: 20px;">
            <p style="margin: 0 0 5px; color: ${colors.text}; font-size: 16px; font-weight: bold;">${item.title}</p>
            <p style="margin: 0; color: ${colors.textMuted}; font-size: 14px; line-height: 1.5;">${item.detail}</p>
          </td>
        </tr>
      `).join('');
      
      sectionsHtml += `
        <tr>
          <td style="padding: 20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${datesListStr}
            </table>
          </td>
        </tr>
      `;
    }
    // Standard Content (Head, Sport, etc.)
    else {
      const gallery: string[] = ex.gallery || (sec.image_url ? [sec.image_url] : []);
      
      let imagesHtml = '';
      if (gallery.length > 0) {
        imagesHtml = gallery.map(img => `
          <tr>
            <td style="padding: 10px 0 20px;">
              <img src="${img}" width="600" style="max-width: 100%; display: block; border-radius: 16px;" alt="${sec.title}" />
            </td>
          </tr>
        `).join('');
      }

      sectionsHtml += `
        ${imagesHtml}
        <tr>
          <td style="padding-bottom: 20px;">
            ${renderParagraphs(sec.body)}
          </td>
        </tr>
      `;
    }
  });


  const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${newsletter.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          
          <!-- Banner -->
          <tr>
            <td style="background-color: ${colors.green}; padding: 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <img src="https://riverviewprep.edu/images/logo.png" width="80" alt="Riverview Prep" style="display: block;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px; color: ${colors.gold}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">
                      ${newsletter.term} &nbsp;|&nbsp; ${newsletter.issue_number} &nbsp;|&nbsp; ${formattedDate}
                    </p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; line-height: 1.2;">
                      ${newsletter.headline || newsletter.title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${highlights.length > 0 ? `
            <tr>
              <td style="background-color: #1a5c2b; padding: 15px 40px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                  ${highlights.join(' &nbsp;|&nbsp; ')}
                </p>
              </td>
            </tr>
          ` : ''}

          <!-- Content Body -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                
                ${newsletter.subheadline ? `
                  <tr>
                    <td style="padding: 20px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="4" style="background-color: ${colors.gold};"></td>
                          <td style="padding-left: 20px;">
                            <p style="margin: 0; font-family: Georgia, serif; font-size: 20px; color: ${colors.green}; font-style: italic; line-height: 1.5;">
                              ${newsletter.subheadline}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                ` : ''}

                ${sectionsHtml}

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <img src="https://riverviewprep.edu/images/logo.png" width="40" alt="Riverview Prep" style="display: inline-block; opacity: 0.5; margin-bottom: 20px;" />
              <p style="margin: 0 0 10px; color: ${colors.textMuted}; font-size: 14px; font-weight: bold;">Riverview Preparatory School</p>
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 12px;">Malelane, Mpumalanga, South Africa</p>
              
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" style="background-color: transparent; border: 1px solid ${colors.green}; border-radius: 50px;">
                    <a href="https://riverviewprep.edu/news/${newsletter.slug}" target="_blank" style="display: inline-block; padding: 10px 20px; font-family: sans-serif; font-size: 12px; color: ${colors.green}; text-decoration: none; font-weight: bold;">Read in Browser</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Unsubscribe Footer -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                You are receiving this email because you are subscribed to the Riverview Reporter.<br/>
                <a href="*|UNSUB|*" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from this list</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
