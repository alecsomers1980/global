-- 0005 — seed the storefront with the products from the legacy WooCommerce shop.
-- Prices are intentionally left at R0 (price_cents = 0); set real prices in /admin/shop.
-- Re-runnable: ON CONFLICT (slug) DO NOTHING, so it won't clobber later admin edits.
-- Requires 0003_shop.sql (tables). The Phase-4 flag columns are guarded below so this
-- works even if 0004_verification.sql hasn't been applied yet.

alter table public.shop_products add column if not exists requires_consent     boolean not null default false;
alter table public.shop_products add column if not exists requires_appointment boolean not null default false;
alter table public.shop_products add column if not exists sla_hours            int not null default 0;

insert into public.shop_products
  (slug, name, description, kind, price_cents, requires_upload, revisions,
   requires_consent, requires_appointment, sla_hours, is_active, sort_order)
values
  (
    'cv-template-private',
    'CV Template – Private Sector',
    $desc$Stand out in the South African job market with a recruiter-designed CV template.

• Designed by recruiters who review hundreds of CVs a day
• Tailored keywords and phrasing for South African industries
• Professional, modern, easy-to-read layouts
• Fully customisable to your skills and career goals
• Save time and skip the formatting stress

A unique, eye-catching structure that resonates with local recruiters — not a generic template.$desc$,
    'instant', 0, false, 0, false, false, 0, true, 1
  ),
  (
    'cv-template-government',
    'CV Template – Government Sector',
    $desc$Is your CV failing to navigate the South African government job market?

• Insider expertise — we have shortlisted thousands of candidates for government posts
• Covers the information government applications require that standard CVs miss
• Helps you meet government formatting and content guidelines
• Clean, easy-to-read, professional design

Researched and expertly designed for the South African market, to get you the interviews you deserve.$desc$,
    'instant', 0, false, 0, false, false, 0, true, 2
  ),
  (
    'cv-revamp',
    'CV Revamp Service',
    $desc$Elevate your job hunt with a professionally revamped CV — stand out, grab attention, land your dream job.

• Recruiter expertise: we translate your skills into language hiring managers respond to
• Strategic structuring: a clear, concise, ATS-friendly layout that highlights your strengths
• Content optimisation: compelling narratives and power-packed bullet points
• Keyword integration: so your CV passes through applicant tracking systems with ease
• Formatting finesse: a polished, error-free, professional finish

Includes a thorough analysis, a full rewrite and up to two rounds of revisions until you are satisfied. Upload your current CV after checkout.$desc$,
    'service', 0, true, 2, false, false, 72, true, 3
  ),
  (
    'cover-letter',
    'Cover Letter Service',
    $desc$First impressions matter. Your cover letter is often the first thing a hiring manager sees — so it needs to be attention-grabbing, persuasive and tailored to the job.

• Save time: skip the writer's block with a proven framework and structure
• Stand out: move beyond the generic templates everyone else uses
• Win interviews: a well-written cover letter significantly boosts your chances

Tailored to your unique journey by our recruitment experts.$desc$,
    'service', 0, false, 1, false, false, 72, true, 4
  ),
  (
    'criminal-record-check',
    'Criminal Record Check',
    $desc$Competitive, safe and reliable fingerprint uploads for police clearance and criminal record checks.

• Upload your fingerprints at our offices: Johannesburg North, Brackenhurst (Alberton) or Mitchell's Plain (Cape Town)
• Wide coverage: fingerprint hub locations across South Africa
• On-site bulk uploads for companies — cost-effective options on request
• Swift and reliable: accurate results within 48–72 hours

Want to know where you stand? Book with us today.$desc$,
    'service', 0, false, 0, true, true, 72, true, 5
  ),
  (
    'qualification-verification',
    'Qualification Verification',
    $desc$We meticulously verify candidates' qualifications — academic degrees, professional certifications, vocational training and specialised credentials — so you can hire with confidence.$desc$,
    'service', 0, false, 0, true, false, 72, true, 6
  ),
  (
    'umalusi-matric-certification',
    'Umalusi Matric Certification',
    $desc$As a verification agent registered with Umalusi, we conduct thorough verification of a wide range of certificates, including:

• Matric (from November 1992): the Amended Senior Certificate (ASC) and National Senior Certificate (NSC)
• Vocational qualifications: the National Technical Certificate N3 and National Certificate Vocational (NCV)
• Adult Education and Training: the General Education and Training Certificate for Adults (GETC: ABET)$desc$,
    'service', 0, false, 0, true, false, 72, true, 7
  )
on conflict (slug) do nothing;
