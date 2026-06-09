import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// ==========================================
// COMPREHENSIVE WEBSITE KNOWLEDGE BASE
// Indexed from all public pages. Update when pages change.
// ==========================================
const SITE_KNOWLEDGE: { section: string; content: string }[] = [
  // ── ABOUT PAGE ──
  {
    section: 'School History & Founding',
    content: 'Riverview Preparatory School was born in 1996 from a community need for English-medium Christian education in the Onderberg region. A group of visionary parents gathered at Tulloh Farm to lay the foundations. On January 14, 1997, the school welcomed its first 57 pioneering students in a farmhouse setting, guided by four founding teachers. A local agricultural farm was acquired in 1998 and transformed in just three months into custom classrooms, libraries, and offices supporting a full primary school curriculum.'
  },
  {
    section: 'Mission & Motto',
    content: 'Mission: We strive for educational excellence guided by Christian principles, while developing pupils who are universally competitive, guardians of their environment, heritage, social well-being and who contribute to the welfare of the community. School Motto: Integrity.'
  },
  {
    section: 'Core Values',
    content: 'Love — nurturing unconditional acceptance, warmth, mutual respect, self-worth, growth, motivation, and humour. Faith — staying true to our heritage through unwavering commitment, consistency, loyalty, hard work, and spiritual growth. Integrity — guided by transparency, dignity, respect, trustworthiness, justice, fairness, and the courage to always do what is right.'
  },
  {
    section: 'School Song',
    content: 'Riverview has a school song that celebrates the school spirit and community. The song is performed at assemblies and school events.'
  },
  {
    section: 'Staff Directory',
    content: 'Headmaster: Mr Murray Johnson. Secretary: Mrs Ann-Marie Rutherford. Bursar: Mrs Jacomin Ferreira. Marketing: Mrs Chanelle de Kock. Cubs: Mrs Jenny Bhana. Grade 000: Mrs Lezanne Nel. Grade 00: Mrs Amoré Stander. Grade 0: Mrs Debbie Tapson. Grade 1: Mrs Wendy McKinnon. Grade 2: Ms Megan Swart. Grade 3: Mrs Michelle Johnson. IT & Library: Mrs Karen Kaligan. Grade 4: Mrs Bronwyn Thomson. Grade 5: Mrs Doanda Meyers. Grade 6: Mrs Bianca Nieuwenhuizen. Grade 7: Mrs Gill Brokensha. Science: Mrs Grace Sutherland. Sports Coordinator: Mrs Lize-Marie Dreyer. Sports Intern: Mr Eric Vilakazi. Estate Manager: Mr Andre Els. Occupational Therapist: Mrs Alexa Kotze. Speech Therapist: Mrs Leandri Wolmarans. Music/Admin: Mrs Janet Jeary. The school has 23 staff members covering all grades from Cubs through Grade 7 plus specialist roles.'
  },
  {
    section: 'Values & Faith',
    content: 'Riverview is a Christian school guided by Christian principles. Wednesday assemblies focus on praise and worship, anchoring holistic values. The school welcomes families of all faiths while maintaining its Christian foundation.'
  },
  {
    section: 'Associations & Accreditation',
    content: 'Riverview Prep is a member of ISASA (Independent Schools Association of Southern Africa), IQAA (Independent Quality Assurance Agency), WESSA Eco-Schools, and the MySchool MyVillage MyPlanet programme. These accreditations ensure the school meets high independent school standards.'
  },

  // ── ACADEMICS PAGE ──
  {
    section: 'Pre-School Grades',
    content: 'Pre-School at Riverview includes: Cubs (18 months to 3 years) focusing on sensory play, social skills and gross motor basics. Grade 000 (3-4 years) with age-appropriate milestones. Grade 00 (4-5 years) with intentional play-based instruction. Grade 0 (5-6 years) with targeted school-readiness preparation and basic arithmetic. The Pre-School is set in a beautiful garden setting designed for safe, enjoyable play, balancing exploration with structured learning.'
  },
  {
    section: 'Primary School',
    content: 'Primary School covers Grade 1 through Grade 7 with a maximum of 25 learners per class. Students receive highly focused, individualized learning. The school has fully serviced libraries and fully functional IT Labs. The curriculum includes immersive day tours and extended excursions. Riverview students achieve success across international standard assessments and frequently receive high school scholarships.'
  },
  {
    section: 'Policies',
    content: 'School Uniform Policy: Complete, clean regulation uniforms required (green and white). Girls may wear ear sleepers only, with discreet necklaces allowed. Regulation green/white hair accessories required. Standard sun hats strictly required outdoors. Discipline Policy: Rules are explained early with transparent, constructive correction steps between assigned mentors. Supportive parent panels collaborate on corrective layouts. The school is a nut-free campus due to allergy policies.'
  },

  // ── ADMISSIONS PAGE ──
  {
    section: 'Application Process',
    content: 'The 4-step admissions process: Step 1 — Submit completed application forms together with copies of child\'s birth certificate, clinic card, latest report, and parents\' IDs. Step 2 — Pay the R200 application fee. Step 3 — The office will contact you to schedule an age-comparable entrance evaluation appointment. Step 4 — Final outcomes are reviewed by a panel and communicated to parents. Application documents include: General Application Form, Parental Consent & Agreement, Medical Details & Questionnaire, and Debit Order Authorization. Documents can be requested via email.'
  },
  {
    section: 'Fee Structure',
    content: 'Pre-School fees (2026): Cubs 3 days/week — R2,400/month (R26,400 annually) with R3,050 deposit. Cubs 5 days/week — R3,050/month (R33,550 annually) with R3,050 deposit. Grade 000-00 — R4,350/month (R47,850 annually) with R4,350 deposit. Primary School fees (2026): Grade 0 — R6,620/month (R72,820 annually). Grades 1-7 — R6,850/month (R75,350 annually). Fees are paid over 11 months (January to November) in advance. 5% discount if paid annually before January 31st. Sibling discounts: 2nd child 25% off, 3rd child 50% off.'
  },
  {
    section: 'Banking Details',
    content: 'Bank: Standard Bank Malelane. Branch Code: 053252. Account Number: 030408377. Reference: Child\'s Surname and Name or Account Number.'
  },

  // ── CO-CURRICULUM PAGE ──
  {
    section: 'Sports Programme',
    content: 'Riverview follows a "Personal Best" philosophy — sport is about establishing lifelong patterns of physical activity, good health, and physical coordination, not primarily about winning. Every learner participates regardless of ability. Foundation Stage (U7 & U9): all learners participate in mini-tournaments rotating through positions. Performance Stage (U10+): skilled candidates advance further with structured coaching. Sports offered: Athletics (Terms 1 & 4), Swimming (Terms 1 & 4), Rugby (Term 2, Seniors), Soccer (Term 2), Netball (Term 2), Hockey (Term 3), Cricket (Terms 3 & 4), Tri-Biathlon (Term 4), Cross Country (Term 4).'
  },
  {
    section: 'Culture Programme',
    content: 'Cultural activities include: Choir, Drama, Public Speaking, Art Club, and Chess. Creative Arts explores mediums like clay, wire, chalk, and watercolours, with inspiration from historical masterpieces. Annual Eisteddfod Art entries are submitted. Music and Movement classes develop free expression. The school library provides a calm reading environment.'
  },
  {
    section: 'After-Hours Programmes',
    content: 'After-hours programmes available for voluntary enrolment: Monkeynastix (core movement and physical dexterity), Swimming Lessons (water safety), Speech Therapy (communicative clarity, provided by Mrs Leandri Wolmarans), and Occupational Therapy (provided by Mrs Alexa Kotze). Aftercare is available until 17:30 daily.'
  },

  // ── ALUMNI PAGE ──
  {
    section: 'Alumni Network',
    content: 'The Riverview Alumni Network connects former students with the school community. Alumni can register via the website to receive school news and event invitations. The network celebrates alumni achievements through Spotlight features. Alumni are encouraged to share memories and attend school events. The school has graduating classes dating back to its founding in 1996.'
  },

  // ── GENERAL SCHOOL INFO ──
  {
    section: 'Contact Information',
    content: 'Email: info@riverviewprep.org. Phone: +27 (0) 13 790 0000. Physical address: Malelane, Mpumalanga, South Africa. The school office is open during school hours (07:30-14:00) for enquiries and visits.'
  },
  {
    section: 'School Hours',
    content: 'Pre-School hours: 07:30 to 13:30. Primary School hours: 07:30 to 14:00. Aftercare is available until 17:30. Students should arrive by 07:30. The school operates Monday through Friday during term time.'
  },
  {
    section: 'Term Dates 2026',
    content: 'Term 1: 15 January to 28 March 2026. Term 2: 15 April to 27 June 2026. Term 3: 22 July to 26 September 2026. Term 4: 14 October to 5 December 2026. Term calendars are available for download from the Academics page.'
  },
  {
    section: 'Facilities',
    content: 'Facilities include: fully equipped library, IT lab with computers, rugby/soccer/cricket fields, netball and tennis courts, swimming pool, aftercare facility, pre-school garden play area, and custom-built classrooms. The school is set on a former agricultural farm with spacious grounds.'
  },
  {
    section: 'Class Sizes',
    content: 'Maximum 25 learners per class across all primary grades. This ensures highly focused, individualized attention for every student. The small class sizes are a key differentiator of Riverview Prep.'
  },
  {
    section: 'Newsletters',
    content: 'The Riverview Reporter is the school\'s digital newsletter published fortnightly during term time. It covers school news, sports results, cultural achievements, upcoming events, and headmaster messages. Parents can subscribe via the website to receive it directly in their inbox. Past editions are available on the News page. The newsletter was redesigned as a digital-first interactive format in 2026.'
  },
];

// Stop words
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'what',
  'when', 'where', 'who', 'whom', 'which', 'why', 'how', 'tell', 'me',
  'know', 'find', 'show', 'give', 'need', 'want', 'please', 'thanks',
  'there', 'their', 'they', 'i', 'you', 'he', 'she', 'it', 'we',
  'and', 'or', 'but', 'if', 'then', 'else', 'not', 'no', 'yes',
  'upcoming', 'list', 'any', 'get', 'see', 'looking', 'information',
  'does', 'school', 'riverview', 'prep', 'preparatory',
]);

function extractKeywords(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[?,!.']/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// Category intent patterns — maps question words to relevant knowledge sections
const INTENT_PATTERNS: { patterns: RegExp[]; sectionBoost: string[] }[] = [
  {
    patterns: [/fee|cost|price|pay|rand|R\d|monthly|annual|discount|deposit|afford|amount/i],
    sectionBoost: ['Fee Structure', 'Banking Details'],
  },
  {
    patterns: [/apply|admission|enrol|register|application/i],
    sectionBoost: ['Application Process', 'Fee Structure'],
  },
  {
    patterns: [/who|teacher|staff|teach|headmaster|grade \d|role/i],
    sectionBoost: ['Staff Directory'],
  },
  {
    patterns: [/sport|rugby|cricket|swim|hockey|netball|tennis|athletic|cross country/i],
    sectionBoost: ['Sports Programme', 'After-Hours Programmes'],
  },
  {
    patterns: [/culture|choir|drama|art|chess|music|worship/i],
    sectionBoost: ['Culture Programme'],
  },
  {
    patterns: [/uniform|wear|clothing|dress|hat|sun ?hat|hair|shoe/i],
    sectionBoost: ['Policies'],
  },
  {
    patterns: [/hour|time|when|open|close|aftercare|after.?care/i],
    sectionBoost: ['School Hours', 'After-Hours Programmes'],
  },
  {
    patterns: [/term|holiday|break|calendar|january|april|july|october|date/i],
    sectionBoost: ['Term Dates 2026'],
  },
  {
    patterns: [/class size|how many|max|learner|student|child/i],
    sectionBoost: ['Class Sizes', 'Primary School', 'Pre-School Grades'],
  },
  {
    patterns: [/newsletter|reporter|news|edition/i],
    sectionBoost: ['Newsletters'],
  },
  {
    patterns: [/mission|motto|value|christian|faith|integrity|love|belief/i],
    sectionBoost: ['Mission & Motto', 'Core Values', 'Values & Faith'],
  },
  {
    patterns: [/history|found|start|begin|1996|1997|1998|farm|origin/i],
    sectionBoost: ['School History & Founding'],
  },
  {
    patterns: [/alumni|graduate|past student|former/i],
    sectionBoost: ['Alumni Network'],
  },
  {
    patterns: [/contact|email|phone|call|address|office|location|where/i],
    sectionBoost: ['Contact Information'],
  },
  {
    patterns: [/bank|account|payment|reference|deposit/i],
    sectionBoost: ['Banking Details'],
  },
];

// Search knowledge base with intent boosting
function searchKnowledgeBase(question: string): string {
  const keywords = extractKeywords(question);
  const questionLower = question.toLowerCase();

  // Determine intent boosts — which sections match the question domain
  const boostedSections = new Set<string>();
  INTENT_PATTERNS.forEach(({ patterns, sectionBoost }) => {
    if (patterns.some(p => p.test(questionLower))) {
      sectionBoost.forEach(s => boostedSections.add(s));
    }
  });

  // Score each entry with intent boosting
  const scored = SITE_KNOWLEDGE.map(entry => {
    let score = boostedSections.has(entry.section) ? 50 : 0; // Large boost for intent match
    const contentLower = entry.content.toLowerCase();
    const sectionLower = entry.section.toLowerCase();

    keywords.forEach(kw => {
      const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const contentMatches = (contentLower.match(new RegExp(safeKw, 'g')) || []).length;
      const sectionMatches = (sectionLower.match(new RegExp(safeKw, 'g')) || []).length;
      score += contentMatches * 2 + sectionMatches * 5;
    });

    return { entry, score };
  });

  // Always include all intent-matched entries (up to 3) + top keyword matches
  const intentMatches = scored
    .filter(s => boostedSections.has(s.entry.section))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const otherMatches = scored
    .filter(s => !boostedSections.has(s.entry.section) && s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const allMatches = [...intentMatches, ...otherMatches]
    .slice(0, 5)
    .map(s => `[${s.entry.section}]\n${s.entry.content}`);

  return allMatches.length > 0 ? allMatches.join('\n\n') : '';
}

// Format DB results into text blocks
function formatEvents(events: any[] | null): string {
  if (!events?.length) return '';
  return 'EVENTS:\n' + events.map((e: any) =>
    `- ${e.title} | Date: ${e.event_date || 'TBA'} | Venue: ${e.venue || 'TBA'} | Category: ${e.category} | Status: ${e.status}${e.description ? ' | ' + e.description.substring(0, 150) : ''}`
  ).join('\n');
}

function formatCalendar(entries: any[] | null): string {
  if (!entries?.length) return '';
  return 'CALENDAR:\n' + entries.map((c: any) =>
    `- ${c.title} | Date: ${c.date} | Location: ${c.location || 'TBA'} | Type: ${c.type}${c.description ? ' | ' + c.description : ''}`
  ).join('\n');
}

function formatStaff(staff: any[] | null): string {
  if (!staff?.length) return '';
  return 'STAFF:\n' + staff.map((s: any) =>
    `- ${s.full_name} | Role: ${s.role}${s.grade_level ? ' | Grade: ' + s.grade_level : ''}${s.bio ? ' | ' + s.bio.substring(0, 100) : ''}`
  ).join('\n');
}

function formatNewsletters(newsletters: any[] | null): string {
  if (!newsletters?.length) return '';
  return 'RECENT NEWSLETTERS:\n' + newsletters.map((n: any) =>
    `- ${n.title} | ${n.term} | Issue ${n.issue_number} | ${n.publish_date}${n.headline ? ' | ' + n.headline : ''}`
  ).join('\n');
}

function formatAnnouncements(announcements: any[] | null): string {
  if (!announcements?.length) return '';
  return 'ANNOUNCEMENTS:\n' + announcements.map((a: any) =>
    `- ${a.title}${a.content ? ' | ' + a.content.substring(0, 200) : ''} | ${new Date(a.created_at).toLocaleDateString('en-GB')}`
  ).join('\n');
}

function formatSettings(settings: any[] | null): string {
  if (!settings?.length) return '';
  return 'SCHOOL INFO:\n' + settings.map((s: any) => `- ${s.key}: ${s.value}`).join('\n');
}

const BASE_CONTEXT = `You are "Ask Riverview", the official AI assistant for Riverview Preparatory School in Malelane, Mpumalanga, South Africa (founded 1996).

INSTRUCTIONS:
- Answer questions using the KNOWLEDGE BASE and LIVE DATA provided below
- The KNOWLEDGE BASE contains factual information from the school's website pages
- The LIVE DATA is from the school's database (events, staff, calendar, newsletters, etc.)
- Always prefer information from the provided context over your own knowledge
- If you find the answer in the context, cite which section it came from
- Keep answers concise (2-4 sentences) unless the question requires detail
- If you cannot find the answer anywhere in the context, say so and suggest contacting info@riverviewprep.org or calling +27 (0) 13 790 0000
- Be warm, professional, and helpful`;

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const supabase = await createServerSupabase();
  const keywords = extractKeywords(message);

  // 1. Search static knowledge base
  const knowledgeMatch = searchKnowledgeBase(message);

  // 2. Search live database (parallel queries)
  const liveDataSections: string[] = [];

  try {
    const orClause = keywords.length > 0
      ? keywords.map(k => `title.ilike.%${k}%,description.ilike.%${k}%`).join(',')
      : '';

    const staffOrClause = keywords.length > 0
      ? keywords.map(k => `full_name.ilike.%${k}%,role.ilike.%${k}%,bio.ilike.%${k}%,grade_level.ilike.%${k}%`).join(',')
      : '';

    const settingsOrClause = keywords.length > 0
      ? keywords.map(k => `key.ilike.%${k}%,value.ilike.%${k}%`).join(',')
      : '';

    const announcementsOrClause = keywords.length > 0
      ? keywords.map(k => `title.ilike.%${k}%,content.ilike.%${k}%`).join(',')
      : '';

    const [eventsRes, calendarRes, staffRes, newslettersRes, settingsRes, announcementsRes] = await Promise.all([
      orClause ? supabase.from('events').select('title, event_date, venue, category, status, description').or(orClause).limit(5) : Promise.resolve({ data: null }),
      orClause ? supabase.from('calendar_entries').select('date, title, location, type, description').or(orClause).limit(5) : Promise.resolve({ data: null }),
      staffOrClause ? supabase.from('staff').select('full_name, role, grade_level, bio').or(staffOrClause).limit(5) : Promise.resolve({ data: null }),
      orClause ? supabase.from('newsletters').select('title, term, issue_number, publish_date, excerpt, headline').or(orClause).order('publish_date', { ascending: false }).limit(3) : Promise.resolve({ data: null }),
      settingsOrClause ? supabase.from('settings').select('key, value').or(settingsOrClause).limit(5) : Promise.resolve({ data: null }),
      announcementsOrClause ? supabase.from('announcements').select('title, content, created_at').or(announcementsOrClause).order('created_at', { ascending: false }).limit(3) : Promise.resolve({ data: null }),
    ]);

    const dbBlocks = [
      formatEvents(eventsRes.data),
      formatCalendar(calendarRes.data),
      formatStaff(staffRes.data),
      formatNewsletters(newslettersRes.data),
      formatSettings(settingsRes.data),
      formatAnnouncements(announcementsRes.data),
    ].filter(Boolean);

    liveDataSections.push(...dbBlocks);
  } catch (err) {
    console.error('Live data fetch error:', err);
  }

  // Build final prompt
  const contextParts: string[] = [];
  if (knowledgeMatch) contextParts.push('=== KNOWLEDGE BASE (from website pages) ===\n' + knowledgeMatch);
  if (liveDataSections.length > 0) contextParts.push('=== LIVE DATABASE DATA ===\n' + liveDataSections.join('\n\n'));
  if (!knowledgeMatch && liveDataSections.length === 0) contextParts.push('No specific information found for this query. Suggest the user contact the school office.');

  const fullPrompt = BASE_CONTEXT + '\n\n' + contextParts.join('\n\n');

  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: 'AI assistant is not configured yet. Please set the GOOGLE_GEMINI_API_KEY in environment variables.' });
    }

    // Combine system context + user question into a single message for reliability
    const promptText = `${fullPrompt}\n\nUser question: ${message}\n\nAnswer the question based on the context above. If the answer is in the context, provide it directly. If not, say you cannot find that information.`;

    const geminiBody = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Gemini API error:', data.error || data);
      return NextResponse.json({ reply: 'I am currently unavailable. Please try again later.' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      console.error('Gemini empty response. Finish reason:', data.candidates?.[0]?.finishReason);
      console.error('Prompt excerpt:', promptText.substring(0, 300));
      return NextResponse.json({ reply: 'I was unable to find an answer for that. Please email info@riverviewprep.org or call +27 (0) 13 790 0000 for assistance.' });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({
      reply: 'I am currently unavailable. Please email info@riverviewprep.org or call the school office for immediate assistance.',
    });
  }
}
