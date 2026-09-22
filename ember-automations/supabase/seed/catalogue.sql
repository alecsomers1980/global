insert into catalogue_items (name, description, size, verticals, sort_order)
select v.name, v.description, v.size, v.verticals, v.sort_order
from (values
  ('Review engine', 'Ask every customer for a review, publish the good ones, route the bad ones privately first', 'M', '{}'::text[], 1),
  ('Abandoned-quote recovery', 'Nudge anyone who starts a quote and stops', 'S', '{}'::text[], 2),
  ('WhatsApp quote assistant', 'Answers size, price and delivery questions and hands real leads to you', 'L', '{}'::text[], 3),
  ('Google Shopping feed', 'Products and prices into Google''s product results', 'M', '{ecommerce,water}'::text[], 4),
  ('Afrikaans second language', 'Full second-language site', 'M', '{}'::text[], 5),
  ('Water Security Planner', 'Roof size and rainfall in, tank size and priced system out', 'L', '{water}'::text[], 6),
  ('Live supplier price sync', 'Supplier price list lands, every price updates itself', 'L', '{water,ecommerce}'::text[], 7),
  ('Delivery cost calculator', 'Real cost and lead time at the customer''s postcode', 'L', '{water,ecommerce}'::text[], 8),
  ('Online checkout & payments', 'PayFast/Ozow/card/EFT checkout', 'L', '{ecommerce,water}'::text[], 9),
  ('Installer network', 'Vetted installers mapped, rated and booked', 'L', '{water}'::text[], 10),
  ('Bulk & commercial portal', 'Volume tiers, purchase orders, account terms', 'L', '{water,ecommerce}'::text[], 11),
  ('Rain & restriction triggers', 'Campaign fires when a municipality announces restrictions', 'M', '{water}'::text[], 12),
  ('Monthly AI article with approve queue', 'Drafted article each month, approved by you, auto-published', 'M', '{}'::text[], 13),
  ('New-stock auto social posts', 'Every new listing posted to Facebook/Instagram automatically', 'M', '{automotive}'::text[], 14),
  ('Walkaround video pipeline', 'Stock video generated and approved before posting', 'L', '{automotive}'::text[], 15),
  ('Monthly performance PDF report', 'GA + Meta + site data in one approved PDF', 'M', '{}'::text[], 16),
  ('Finance calculator page', 'Standalone finance calculator with lead capture', 'M', '{automotive}'::text[], 17),
  ('Jobcard pricing & milestones', 'Rate/charge milestones on jobcards with a priced list', 'L', '{signage}'::text[], 18),
  ('Claude connector for your portal', 'Talk to your own data from Claude', 'L', '{}'::text[], 19),
  ('Timesheet actuals engine', 'POS timecard import, rules engine, monthly timesheet and balances', 'L', '{hospitality}'::text[], 20),
  ('Roster planning', 'Planned vs actual per day per unit', 'L', '{hospitality}'::text[], 21),
  ('Candidate intake form', 'Rejects incomplete applications before they reach your team', 'L', '{recruitment}'::text[], 22),
  ('Native job pages with Google-for-Jobs schema', 'SEO job pages fed from your ATS', 'M', '{recruitment}'::text[], 23),
  ('Affiliate program', 'Self-serve sign-up, approval, dashboard, payouts', 'L', '{ecommerce,recruitment}'::text[], 24),
  ('Contact-form health probe', 'Weekly check that every form actually sends', 'S', '{}'::text[], 25),
  ('Domain cut-over & DNS', 'Point the domain at the new site with zero downtime', 'S', '{}'::text[], 26),
  ('Legal pages (POPIA/PAIA/T&Cs)', 'Completed with company details', 'S', '{}'::text[], 27),
  ('Take payments live', 'Move the gateway from sandbox to live with receipts', 'S', '{ecommerce}'::text[], 28)
) as v(name, description, size, verticals, sort_order)
where not exists (select 1 from catalogue_items c where c.name = v.name);

