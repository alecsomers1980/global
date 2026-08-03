<!-- converted from Everest-Motoring-Briefing-Pack-3-July-2026.docx -->

Everest Motoring — Briefing Pack
____________________________________________________________
# 1. Monthly Performance Report (sent on the 1st of each month)
## What it is
An automatically generated, branded PDF report emailed to you at the start of each month, summarising the previous month's performance across your whole digital presence — not just the website.
## What's built
- Automated PDF generator producing a clean, multi-page branded report.
- Website Activity — vehicles listed, leads captured, trade-in requests. *(Live and working — sourced directly from your site's database.)*
- Website Traffic — visitors, sources, new vs. returning, top pages (Google Analytics).
- Email performance — enquiry and notification activity.
- Affiliate Marketing Performance - affiliate leads, completed deals, commission owed, new affiliates
- Social performance — pulled automatically from Ember Social (see §3): engagement (reactions, comments, shares), link clicks and video views.
- Automatic monthly delivery — a scheduled job builds and emails the report on the 1st.
## What's needed to move forward
- Content sign-off (client decision): walk through the current report in the meeting and confirm what to keep, add or drop. Once approved, we switch the monthly send on.
- Social reach reporting (decision): in June 2026 Facebook removed post-level reach/impressions for everyone. We can still report engagement, clicks and video views per post; for "reach" we'd move to a page-level figure. ____________________________________________________________
# 2. Automatic listing to cars.co.za & AutoTrader
## What it is
Automatically publishing your in-stock vehicles to the two big classified portals — without manual re-capturing on each site — since neither portal offers a public data connection (API) for this.
## What's built
- Full "add vehicle" automation for both portals. The system logs into the dealer portal, opens the *Add Vehicle* form and fills every field — year, make/model/variant, mileage, price, colour, condition, features, photos — pulling straight from your Everest inventory.
- Safety by design: it stops just before the final "submit" and never sets a listing to "active." Nothing goes public without a person clicking the last button. (No accidental or duplicate live listings.)
- In-admin trigger: each vehicle row in your Everest admin now has "cars.co.za" and "AutoTrader" buttons that kick off the automation for that car.
- Your data already fits both portals 100% — no changes to your system were needed. Vehicle features were even relabelled to match cars.co.za's exact wording, and AutoTrader descriptions are trimmed to their length limit automatically.
- Both portals' create flows have been run end-to-end successfully (form fully filled, photos uploaded) up to the stop point.
## The real constraint (and how it's solved)
- cars.co.za is protected by bot-detection (Cloudflare). A plain automated browser is intermittently challenged ("Just a moment…") and can't be relied on to get through on its own. *(AutoTrader is easier.)*
- Solved via "attended mode": a person opens the browser, logs in and clears the one-time check, and then the automation attaches to that already-cleared session and does all the data entry. Confirmed working end-to-end.
- Today this runs from a local machine (browser + a small local helper), triggered from the admin buttons.
## What's needed to move forward
- Submit: Do you want to do the last step (Submitting the cars details on the platform yourself or can we automate it).
- Decide where it runs: the attended flow currently needs a local browser session — agree whose machine / what schedule.
____________________________________________________________
# 3. Social media — Facebook (Ember Social)
## What it is
Ember Social is the system that plans, designs and schedules your social content, then measures how it performs (feeding the monthly report in §1).
## What's built
- A six-template content system — lifestyle hero, cinematic studio, spec card, multi-car, tip card and "sell yours" — so the feed looks like one curated, premium gallery rather than classifieds.
- A complete July 2026 content plan — 12 posts + 2 video reels, Mon–Sat, premium lifestyle-led (see the plan doc for the full calendar and captions).
- Two finished cinematic video reels (real in-stock vehicles, driving footage, golden-hour grade, branded end-card with your number):
- *"Saturday Belongs to Us"* — family day-trip (Hyundai Tucson).
- *"The Long Way Round"* — rugged bushveld run (Land Cruiser 79 · Hilux · Discovery).
- Vertical (9:16) cuts of both reels for Instagram Reels / TikTok — roughly triples reach for the same content.
- 4 premium lifestyle hero images already produced.
- Performance tracking: engagement (reactions, comments, shares), link clicks and video views, and follower growth are collected automatically and feed the monthly report.
## New features
- Videos in posts — the two cinematic reels above, plus a free "static → motion" technique to turn any photo into a short clip for cheap Reels/TikTok volume.
- Carousels — multi-slide posts (hook → detail shots → price/CTA); strong organic reach.
- New content angles — finance/affordability ("from R—/month"), comparison ("which one is you?"), and seasonal/local hooks.
- Caption A/B testing and recurring named slots (Feature Friday, Tip Tuesday, Just Arrived, Sunday Drive) to train the audience.
## What's needed to move forward
- Approve the July plan and tone (decision) — review via the client review link; sign off the premium lifestyle direction.
- Note on reporting — because Facebook removed post-level reach in June 2026, social reporting emphasises engagement, clicks and video views (ties back to §1).
- Forward plan — August onward gets new video concepts each month (concept bank ready); we don't recycle July's two.
Recommendation: approve today so posting starts immediately — July is peak Kruger/road-trip season and the lifestyle content is built for exactly this window.



# 3. Social media — Instagram & Tik Tok

Instagram
I have spent days trying to connect the Instagram and Facebook account but have not managed to find who has the full control of the business meta profile for Everest Motoring.

We can however do the following:

To gain full control of your Meta Business Portfolio when the primary admin is unreachable, you must file an official Business Manager Admin Dispute with Meta Support to verify your business ownership and have them manually grant you full control. Meta does not allow you to move or transfer assets to a new account without administrative privileges or official intervention.
📋 Requirements to File a Dispute
Meta requires extensive documentation to prove you are the legal owner or authorized representative of the business. Prepare the following items:
A government-issued photo ID of the person filing the request.
Official business registration documents (e.g., business license, utility bill, or articles of incorporation).
A signed, notarized statement detailing your relationship to the business, the role of the unreachable admin, the reason they can no longer be reached, and the Facebook account/email that should be granted full control.
Crucial Constraints to Keep in Mind
No Third-Party Agencies: Meta strictly rejects admin dispute claims submitted by external consultants or digital marketing agencies. The submission must come from an actual internal employee or the legal business owner.
Verification Timeline: Once submitted via chat, a Meta representative will review the documents. The process can take anywhere from a few days to a few weeks depending on the clarity of your documentation.
Tik Tok
I have submitted a request to connect to Tik Tok API, just waiting for them to approve or deny it.
You are required to create a video of how your software works and send it to them with a few other items that has to be created for them to approve it.
# 4. Affiliate marketing & the media kit
## What it is
A referral programme that lets partners (agents, influencers, existing customers) promote specific vehicles and earn commission on sales they bring in, with everything tracked automatically.
## What's built ✅
- Affiliate portal — partners log in to their own dashboard.
- Unique affiliate code per partner — issued automatically.
- Leads pipeline — each affiliate sees the leads and vehicles attributed to them and their status, so they can track what they've earned.
- Encrypted bank details for payouts (stored securely).
- Admin management — you approve affiliates and see payout summaries from the Everest admin.
## The media kit (the "examples" for the meeting) ✅
For every vehicle, an affiliate gets a ready-made kit at their fingertips:
- Personal tracking link — e.g. everestmotoring.co.za/inventory/<vehicle>?ref=THEIRCODE. Any sale that follows a click is automatically credited to them. One-tap copy for WhatsApp/social.
- Vehicle video — embedded to preview, plus a downloadable MP4 they can post themselves.
- Printable A4 flyer (auto-generated) — full-page, branded, with the vehicle photo, price, key specs (mileage, transmission, fuel, colour), up to 9 premium features, and a scannable QR code that carries their tracking code. Good for print or as a rich share. (See attachded image)
- Media-kit email template so kits can be sent to affiliates directly.
## What's needed to move forward
- Commission structure (decision): rate (flat R amount or %), and when those payments are done so we can inform the affiliate.
- Payout schedule (decision): how often, and confirmation process before payout.
- Affiliate terms (decision): a short T&Cs / agreement affiliates accept on sign-up.
- First affiliates (decision): who we invite first, and the approval workflow.
- Suggestion: After a few people are signed up and working correctly, I would suggest advertising the affiliate marketing. The more people out there to sell your product the more sales will come in
Recommendation: the technology is finished — this workstream is purely commercial. Set the commission and terms in the meeting and we can onboard a first small group of affiliates within days. *(We can bring a live example flyer + tracking link for a real in-stock vehicle to the meeting.)*
