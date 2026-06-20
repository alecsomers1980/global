# hslabour.co.za — Scraped Site Content (reference for rebuild)

Source: https://hslabour.co.za, scraped via Firecrawl 2026-06-19.

## Brand

**Logo:** https://hslabour.co.za/wp-content/uploads/2023/12/HSL-Logo-112x112.png
**Favicon:** https://hslabour.co.za/wp-content/uploads/2024/01/cropped-Logo-32x32.png
**Logo alt text:** "H & S Labour"

**Colors:**
- Primary: `#011D58` (dark navy)
- Secondary: `#46D835` (bright green)
- Accent: `#334155` (slate)
- Background: `#FFFFFF`
- Text/Link: `#334155`

**Typography:** Roboto (heading + body), system font stack fallback (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif`)
- H1: 36px, H2: 30px, Body: 16px
- Border radius: 5px, base spacing unit: 4px

**Tone:** professional, medium energy, audience = business professionals.

**Tagline:** "Smart Solutions For Efficient Placements" — "Forging lasting partnerships since 1998."

---

## Sitemap (discovered via Firecrawl map)

- / (Home)
- /about
- /jobs
- /submit-cv
- /shop
- /contact
- /affiliate-program
- /cart, /checkout, /my-account (WooCommerce)
- /product-category/* (cv-template, cover-letter, cv, criminal-record-check, matric, umalusi, qualification-verification)
- /product/* (cv-template-private-sector, cv-template-government-sector, cover-letter-service, cv-revamp-service, criminal-record-check, umalusi-matric-certification, qualification-verification)
- Legacy pages under /.cm4all/stcfb/ (old site, pre-WordPress)

---

## Home (/)

**Hero:**
"Your Partner In Recruitment, Temporary Employment, CV Response Handling, Employee Verification, Fraud Detection, IR Management, HR Management, Payroll"
"Let's work together. Forging lasting partnerships since 1998."
CTA: "Hire Us"

**Audience quick-links:**
- "I'm Looking for Work" → Vacancies (/jobs)
- "I'm Looking for Talent" → Hire Us (#services)
- "I'm Looking to Purchase" → Shop Now (/shop)
- "I'm Looking to Make Moola" → Make Moola (/affiliate-program)

**Our Services** (flip-card style: Challenge → Solution)
1. **Recruitment (Permanent and Contract)** — Challenge: "Struggling to quickly find qualified candidates." Solution: "With over 25 years of experience, we provide fast, efficient RECRUITMENT."
2. **Temporary Employment Services (T.E.S.)** — Challenge: "Finding yourself short-staffed during a crucial phase of operations." Solution: "Swiftly address your staffing gaps with our expedited and tailored recruitment solutions."
3. **Response Handling** — Challenge: "Sifting through hundreds of applicants is time-consuming." Solution: "We dive deep into each candidate's CV, pinpointing their skills and experiences, and present you with a concise list of ONLY top contenders."
4. **Job Advertising** — Challenge: "Limited time/resources to post on hundreds of social media pages." Solution: "Dedicated team advertises your job opening across social media groups, job boards and newspapers."
5. **Risk Assessments** — Challenge: "Protecting your business and employees from potential risks." Solution: "Criminal checks (single and onsite bulk uploads), qualification verification, psychometric assessments."

**eBook callout:** "Supercharge your job search and secure your next position with our Exclusive eBook! Packed with essential insights to master the art of job-hunting."

**Testimonials:**
- "Smart, adaptable, and cost-effective. H&S Labour's tailored packages, covering everything from response handling to psychometrics, prove they understand and deliver to unique business needs. A decade of partnership speaks volumes." — Andrew, Director
- "H&S Labour has been a vital partner since 2005. Their tailored solutions, from recruitment to HR services, showcase a deep understanding of our needs. A strategic choice for business growth!" — Jolie, HR

**Accreditation logos:** Department of Employment and Labour (DEL) + 2 other accreditation badges (images at /wp-content/uploads/2024/07/1.png, DEP-Emp-Labour-300x300.png, 3.png — need re-sourcing/re-uploading for rebuild, originals not retrievable via scrape).

---

## About (/about)

**Heading:** "Our Background"
"Established in 1998 we evolved into a diverse portfolio of Recruitment Services, Temporary Employment Services, Response Handling, Vetting & Background Screening, Psychometrics, and HR Services across various industries."

**Our Vision:** "We aspire to be recognized as a premier Service Provider, delivering a Bespoke and Holistic Experience to both our clients and candidates within the realm of recruitment. This commitment reflects our unwavering dedication to upholding our Mission and Values."

**Our Mission:** "Create strong, lasting partnerships with our clients through effective collaboration."

**F.A.Q.**
- *What industries do you specialize in?* — "We pride ourselves on our versatile approach and have successfully operated across a spectrum of industries, including but not limited to technology, finance, engineering, manufacturing, and more."
- *What is the average timeline for filling a position?* — "Timeline varies based on the unique requirements of each role. Our focus is on quality over speed."
- *What types of positions do you typically recruit for?* — "Wide spectrum of positions, ranging from entry-level roles to executive leadership."
- *What sets your recruitment agency apart?* — "Unwavering commitment to not just meeting but exceeding our clients' expectations... industry insight, innovative strategies, and a proven track record."

---

## Jobs (/jobs)

Job board is powered by **Placement Partner** (webapp.placementpartner.com) — live vacancy feed, not static WordPress content. Same eBook callout as homepage repeated at top.

Sample vacancies live at scrape time (illustrative of categories/format, not to be hardcoded):
- Remote Freelancers - Data Capturers/Administrators/QAQCs (Gauteng, Temp)
- Warranty Parts & Finance Controller (Eastern Cape, Permanent)
- Claims Assessor (Eastern Cape, Permanent)
- Quality Manager (National, Contractor)
- Civil Supervisors (National, Contractor)
- Electrical Supervisors (National, Contractor)
- Business Systems Analyst (Gauteng, Permanent)
- SITE FOREMAN - Clerk of Works (Gauteng, Contractor)

Filters: Job Sector/Category (Admin, Agriculture, Artisan, Automotive, Building and Construction, Construction, Engineering, Engineering and Technical, Financial Services, Government, Hospitality, Human Resources, Information Technology, Insurance, Law, Legal, Logistics/Warehouse/Freight, Manufacturing, Medical, Mining, NDT, Pension Fund, Real Estate, Retail, Sales and Marketing, Scientific/Research and Development, Telecommunications, Transport); Region (Eastern Cape, Freestate, Gauteng, Johannesburg, KwaZulu Natal, Limpopo, Mozambique, Mpumalanga, Namibia, National, North West, Northern Cape, Remote Work, Saudi Arabia, Western Cape, Work from Home); Vacancy Type (Permanent, Temp, Contractor).

(Per prior project notes: PlacementPartner is system of record for jobs — rebuild should embed/iframe or sync via API, not hardcode listings.)

---

## Submit CV (/submit-cv)

**Heading:** "Feeling the frustration of job hunting with little success?"
"Break free let us ease the struggle by transforming your CV into a standout tool that captures attention and lands interviews."
CTA: "CV Services" → links to CV Revamp Service product.

---

## Shop (/shop)

**Heading:** "Shop Our Online Services"
"Ease your job-hunting journey with our expertly crafted solutions tailored just for you!"

7 products (all WooCommerce, R0,00 placeholder price — actual quote-based):
1. Cover Letter Service
2. Criminal Record Check
3. CV Revamp Service
4. CV Template – Government Sector
5. CV Template – Private Sector
6. Qualification Verification
7. Umalusi Matric Certification

---

## Contact (/contact)

**Heading:** "Let's Talk"
"Have questions or ready to explore how H&S Labour can elevate your workforce solutions? Feel free to reach out to us through any of the following channels:"

- **Email:** info@hslabour.co.za
- **Phone:** 011 468 4192
- **Office Hours:** Mon–Fri 8:30–16:00

Contact form fields: Name, Phone, Email, "How Can We Help?" dropdown (Recruitment, Temporary Employment Services, Response Handling, Psychometric Assessment, Risk Assessment, IR Management, HR Management, Payroll, Other), Message.

---

## Affiliate Program (/affiliate-program)

**Heading:** "Make A Referral and Earn Some Extra Cash!"
**Subhead:** "Earn Commission by Partnering with Us."

"Do you know someone stuck in job-hunting purgatory? The endless applications, the radio silence, the crushing uncertainty? Imagine having the power to change that. With our life-changing job-hunting e-book, you can do just that – and earn extra income while you're at it!"

**How it works:**
- Empower others: share proven job-hunting strategies with your network.
- Earn handsome commissions: pocket a share of profits per e-book sold.
- Flexibility: promote via blog, social media, or word-of-mouth.
- Open to anyone: content creators, influencers, nurses, teachers, stay-at-home parents.

Cites Q3 2023 QLFS stats: 16.7m employed, 31.9% unemployment rate, target base of 16.7m employed + 7.8m actively job-seeking.

**Sign up:** email info@hslabour.co.za

---

## Notes for rebuild

- Site currently runs on WordPress 7.0 + WooCommerce 10.8.1 + Elementor 4.1.3.
- Product prices are all placeholder R0,00 — actual pricing/quote flow happens off-site or via inquiry (confirm with client before hardcoding).
- Accreditation badge images couldn't be cleanly extracted (generic WP upload paths); re-source originals from client (DEL accreditation + 2 others) rather than hotlinking.
- Jobs page content is dynamic (Placement Partner feed) — do not hardcode listings, integrate via existing PlacementPartner sync per [[project_hslabour_rebuild]] memory.
