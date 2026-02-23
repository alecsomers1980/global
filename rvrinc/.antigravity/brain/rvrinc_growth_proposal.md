# RVR Inc — Growth & Automation Proposal

**Prepared by Antigravity Digital** · 23 February 2026

---

## What We've Built So Far

| Feature | Status |
|---------|--------|
| Homepage (hero with two-column layout, CTAs) | ✅ Live |
| About Us (9 sections, team photos, director bio) | ✅ Live |
| Contact page (side-by-side offices, popup form) | ✅ Live |
| Insights page (placeholder) | ✅ Live |
| Start Your Claim — 5-step onboarding wizard | ✅ Live |
| Header/Footer rebrand ("Update on Your Case") | ✅ Live |
| Admin Panel (cases, reports, clients, documents) | ✅ Live |
| Client Portal (case tracking, documents, appointments) | ✅ Live |
| RAF status system (12-phase pipeline) | ✅ Live |
| Contact form → email API | ✅ Live |
| Authentication & role-based access | ✅ Live |

---

## Proposed New Features

### 🟢 Tier 1 — Quick Wins (High Impact, Fast to Build)

---

#### 1. WhatsApp Click-to-Chat Widget
**What:** A floating WhatsApp button on every page. One tap opens WhatsApp with a pre-filled message: *"Hi, I'd like to discuss an RAF claim with Roets & Van Rensburg."*

**Why it matters:** 80%+ of South African legal inquiries start on WhatsApp. A floating button captures leads who won't fill out forms. Directs to the correct office number based on which page they're on.

---

#### 2. Automated Claim Submission Notifications
**What:** When a client submits the "Start Your Claim" form, three things happen automatically:
1. The firm receives a formatted email (already working)
2. The client receives a branded confirmation email with "what happens next" steps
3. An SMS/WhatsApp is sent to the assigned office coordinator

**Why it matters:** Speed of first contact is the #1 factor in whether a potential client chooses your firm or moves on. Immediate notification means your team can respond within minutes.

---

#### 3. Google Business Profile Integration
**What:** Structured data (Schema.org) markup on every page so Google displays rich results — office hours, phone numbers, reviews, and a "Legal Services" knowledge panel for both offices.

**Why it matters:** Most prospective clients search "RAF attorney near me." Proper Google markup makes RVR Inc appear above competitors with a rich, clickable result including star ratings and direct call buttons.

---

#### 4. Prescription Deadline Tracker
**What:** An automated system in the admin panel that flags cases approaching the 3-year RAF claim prescription deadline. Red alerts at 90, 60, and 30 days before expiry. Email and SMS alerts to the attorney assigned.

**Why it matters:** Missing a prescription deadline means the client loses their claim permanently and the firm faces a professional negligence complaint. This is a zero-tolerance risk. Automating it eliminates human error.

---

### 🟡 Tier 2 — Growth Systems (Revenue & Efficiency Multipliers)

---

#### 5. Automated Client Onboarding Pipeline
**What:** When a claim is submitted via the website, the system automatically:
1. Creates a case record in the database
2. Sends the client a welcome email with required document checklist
3. Opens a personalised document upload portal (like Everest's client portal)
4. Tracks which documents are outstanding and sends automated reminders (Day 3, Day 7, Day 14)
5. Notifies the attorney when all documents are uploaded

**Why it matters:** Document gathering is the single biggest bottleneck in RAF claims. The average manual process takes 2-4 weeks of phone calls and WhatsApp chasing. This reduces it to days, or even hours, because the client uploads everything from their phone at their own pace. Fewer touchpoints = lower cost per case.

---

#### 6. Case Milestone SMS/WhatsApp Notifications
**What:** Automated client notifications at every phase transition in the 12-step RAF pipeline:
- *"Your claim has been filed with the Road Accident Fund."*
- *"We have received the RAF's 120-day investigation response."*
- *"Your settlement offer has been received. Your attorney will call you today."*

**Why it matters:**
- Eliminates the #1 source of client complaints: *"I don't know what's happening with my case"*
- Reduces incoming phone calls by 60%+ (clients are proactively informed)
- Builds trust and drives client referrals — satisfied clients tell others
- Professional SMS communication positions RVR Inc as a modern, client-centric firm

---

#### 7. Referral Program System
**What:** A digital referral system where existing or past clients can refer friends and family through a unique tracking link. The referrer gets a notification when their referral becomes a client. Optional: small thank-you voucher for successful referrals.

**Why it matters:** Personal injury law runs on referrals. Making it formal and trackable:
- Gives clients a reason to actively recommend
- Attributes referrals back to the source (so the firm knows which clients generate the most business)
- Creates a measurable, scalable lead source that costs virtually nothing

---

#### 8. AI-Powered Case Intake Triage
**What:** When a claim is submitted through the website, Google Gemini analyses the accident details, injury descriptions, and supporting information to generate:
1. A **preliminary eligibility assessment** (likely valid claim / needs further investigation / possible prescription issues)
2. A **claim type classification** (general damages, loss of income, loss of support, future medical)
3. A **priority score** (based on injury severity and potential claim value)
4. A **suggested document checklist** tailored to the specific claim type

This appears in the admin panel next to the case, giving the attorney a head start before the first consultation.

**Why it matters:** Saves attorneys 15-30 minutes per new intake. Ensures no relevant document type is missed. Helps the firm prioritise high-value claims that need immediate attention. Identifies prescription risks (time-barred claims) before resources are committed.

---

#### 9. Insights / Blog with SEO Content Engine
**What:** Transform the "Insights" placeholder into a full content hub. An AI-assisted content engine that generates draft articles on high-search-volume topics:
- "How long does an RAF claim take in 2026?"
- "Can I claim from the RAF if I was a passenger?"
- "What is the RAF 4 form and do I need one?"
- "RAF claim calculator — how much is my claim worth?"

Each article includes a CTA to the "Start Your Claim" wizard and internal links to the About and Contact pages.

**Why it matters:** Content marketing is the most cost-effective lead generation channel for law firms. Ranking for "RAF claim near me" or "how to claim from the Road Accident Fund" puts RVR Inc in front of people actively looking for help. Every article is a 24/7 lead generator.

---

### 🔴 Tier 3 — Competitive Edge (Market Differentiation)

---

#### 10. Client Self-Service Portal Enhancements
**What:** Expand the existing "Update on Your Case" portal with:
- **Case timeline**: Visual history of every milestone, document, and note on the case
- **Document vault**: Clients can access their uploaded documents anytime
- **Secure messaging**: Clients message their attorney through the portal instead of WhatsApp (keeps communications in one place, discoverable for audits)
- **Appointment scheduling**: Clients book consultation slots from available calendar times
- **Settlement calculator**: A guided tool that helps clients understand what types of compensation apply to their case

**Why it matters:** No other RAF firm in South Africa offers this. It would make RVR Inc the most transparent, client-friendly personal injury firm in the market. Transparency = referrals = growth.

---

#### 11. Automated Monthly Reports for Management
**What:** An n8n or cron-based automation that generates monthly PDF reports:
- New claims submitted this month
- Cases at each pipeline stage
- Average time per stage (identifying bottlenecks)
- Attorney workload distribution
- Revenue forecast (based on active claims and typical settlement values)

Auto-emailed to the Director and office managers on the 1st of each month.

**Why it matters:** Gives Tanya and office managers data-driven oversight without logging into the admin panel. Identifies which stages are bottlenecking, which attorneys are overloaded, and projects cash flow. This is how firms scale from 50 to 500 active cases.

---

#### 12. Multi-Channel Lead Capture (Google Ads + Facebook Ads Landing Pages)
**What:** Purpose-built landing pages optimised for paid ad campaigns:
- `/claim/injury` — for Google Ads targeting "injury lawyer near me"
- `/claim/accident` — for Facebook ads targeting road accident survivors
- Each page has a simplified 2-step form (name + phone + injury type) and a click-to-call button
- Conversion tracking pixels for Google Ads and Meta integrated

**Why it matters:** The "Start Your Claim" wizard is great for organic traffic, but paid ad users need a faster, friction-free experience. A 2-field form with a single CTA converts 3-5x better than a multi-step wizard for paid traffic. Proper conversion tracking means every rand spent on ads is measurable.

---

#### 13. AI Chatbot for After-Hours Intake
**What:** A Gemini-powered chatbot available on the website 24/7. It:
- Answers common RAF questions instantly
- Captures lead information (name, phone, accident date, injury type) through natural conversation
- Stores the lead in the CRM for follow-up the next business day
- Hands off to a real person (WhatsApp) if the query is urgent

**Why it matters:** Accidents don't only happen during office hours. A chatbot captures leads at 10pm on a Sunday — the most common time people research legal help after an accident. Without it, those potential clients go to the competitor whose phone number was easier to find.

---

### 🟣 Tier 4 — Social Media & Content Automation

---

#### 14. "Client Story Capture" (Automated Content Engine)
**What:** A system that automatically identifies successfully closed cases (`Closed Won`) and triggers a request for a "Client Story." The system then uses AI to:
- **Anonymise** the story for privacy.
- **Convert** the case summary into a 15-second emotional Reel/Short script.
- **Generate** a themed background (e.g., successful outcome, road safety) with text overlays.
- **Produce** a cinematic video for TikTok, Instagram, and Facebook Reels.

**Why it matters:** In personal injury law, "Social Proof" (showing that you win cases) is the most powerful marketing tool. Automating this ensures a constant stream of success stories on social media without manual video editing.

---

#### 15. The AI "Legal Content Factory"
**What:** An automated engine that takes the SEO articles from the "Insights Content Engine" (Tier 2) and repurposes them into:
- **Image Posts**: Key tips from the article (e.g., "5 Things to do after an accident").
- **Explainer Reels**: AI-generated voiceover explaining complex RAF laws.
- **Q&A Shorts**: Answering common client questions in vertical video format.

**Why it matters:** Repurposing one article into 5 social posts maximmises the value of your content. It ensures RVR Inc is visible across all platforms, establishing the firm as a thought leader in RAF law.

---

## Priority Recommendation

| Priority | Feature | Impact | Effort |
|----------|---------|--------|--------|
| 🥇 | WhatsApp Widget | High | 1 day |
| 🥇 | Claim Submission Notifications (email + SMS) | High | 2 days |
| 🥇 | Prescription Deadline Tracker | Critical (risk mitigation) | 2 days |
| 🥇 | **Client Story Capture** | High (Revenue) | 3 days |
| 🥈 | Client Onboarding Pipeline (document portal) | Very High | 5 days |
| 🥈 | Case Milestone SMS/WhatsApp | High | 3 days |
| 🥈 | SEO Content Engine | High (long-term) | 4 days |
| 🥈 | AI Case Intake Triage | High | 3 days |
| 🥈 | **AI Content Factory** | High (Visibility) | 4 days |
| 🥈 | Referral Program | Medium-High | 3 days |
| 🥉 | Portal Enhancements | Differentiating | 7 days |
| 🥉 | Automated Reports | Management tool | 4 days |
| 🥉 | Ad Landing Pages | Revenue driver | 3 days |
| 🥉 | AI Chatbot | After-hours capture | 5 days |
| 🥇 | Google Business Markup | SEO boost | 1 day |

---

*Prepared by Antigravity Digital — Transforming legal practices through intelligent technology.*
