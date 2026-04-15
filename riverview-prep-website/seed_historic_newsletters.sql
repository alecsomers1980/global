-- ====================================================================
-- SEED SCRIPT: IMPORT HISTORIC NEWSLETTERS (PREMIUM CONTENT)
-- Run this in your Supabase SQL Editor to inject the real data
-- ====================================================================

-- Clean up any partial inserts from previous failed attempts
DELETE FROM newsletters WHERE slug IN ('26-february-2026', '12-march-2026', '26-feb-2026');

-- 1. Insert the 26 February 2026 Edition
INSERT INTO newsletters (
  id, title, slug, headline, subheadline, term, issue_number, excerpt, highlights, publish_date, is_published
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '26 February 2026 Edition',
  '26-february-2026',
  'The Riverview Reporter',
  'Champions Inspired by Values • Term 1 • Week 7',
  'Term 1',
  'Week 7',
  'A week of purposeful momentum, balancing the physical rigor of MJ Zwane Athletics with the creative demands of "Oliver with a Twist".',
  '["Athletics Excellence", "Gala Success", "Production Updates"]',
  '2026-02-26',
  true
);

-- Insert blocks for 26 Feb Edition
INSERT INTO newsletter_sections (
  newsletter_id, title, sort_order, section_type, body, image_url, extra_data, author
) VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'From the Headmaster’s Desk', 0, 'head', 
   'We find ourselves in a state of purposeful momentum as we reach the seventh week of our inaugural term. Our campus is alive with activity, from the early-morning training sessions for the MJ Zwane Athletics to the focused rehearsals for "Oliver with a Twist." It is truly inspiring to witness the multifaceted excellence our students demonstrate daily. We take great pride in our enduring partnerships with fellow independent schools in the region, fostering a culture of collegiality that we value beyond the results of any match or meet.', 
   '/Newsletter/26February2026_img_p1_1.png', '{"gallery": ["/Newsletter/26February2026_img_p1_1.png"], "layout": "magazine"}', 'Murray Johnson'),
  
  ('a0000000-0000-0000-0000-000000000001', 'Key Calendar Dates', 1, 'dates', '', '', 
   '{"items": [
     {"date": "26 Feb", "title": "League Relay Gala", "detail": "Hosted at St. Peters"},
     {"date": "28 Feb", "title": "MJ Zwane Athletics", "detail": "Hosted at Hoërskool Nelspruit"},
     {"date": "04 Mar", "title": "Fast 5s Netball & Fast 7s Rugby", "detail": "Hosted at Penryn"},
     {"date": "07 Mar", "title": "Uplands Open Day", "detail": "A wonderful opportunity for our community"}
   ], "layout": "standard"}', ''),

  ('a0000000-0000-0000-0000-000000000001', 'A Monthly Production Update', 2, 'content', 
   'Public reservation for our upcoming production of "Oliver with a Twist" is officially underway. Our students are laboring with immense dedication to bring this cultural milestone to life. We invite our families to join us for a series of exceptional evenings, featuring both dedicated Dinner Theatre experiences and general seating performances. We look forward to seeing the community unite for this spectacular event.', 
   '/Newsletter/26February2026_img_p3_1.jpeg', '{"gallery": ["/Newsletter/26February2026_img_p3_1.jpeg", "/Newsletter/26February2026_img_p3_2.jpeg"], "layout": "magazine_reverse"}', ''),

  ('a0000000-0000-0000-0000-000000000001', 'Sporting Highlights', 3, 'sport', 
   'Our swimming team demonstrated exceptional talent at the recent Flamboyant Relay Gala, securing first-place finishes across multiple divisions. We also extend our most sincere well wishes to Vutomi Mthethwa as she represents our school at the Mpumalanga Schools Athletics Championship—her commitment to long-jump excellence remains a point of immense pride.', 
   '/Newsletter/26February2026_img_p2_1.jpeg', '{"gallery": ["/Newsletter/26February2026_img_p2_1.jpeg", "/Newsletter/26February2026_img_p2_2.jpeg"], "layout": "split"}', ''),

  ('a0000000-0000-0000-0000-000000000001', 'Pre-School Explorations', 4, 'preschool', 
   'Our youngest learners have embarked on a fascinating journey into human biology. By constructing intricate body structures with simple materials, our Cubs are developing a deeper appreciation for the wonders of growth and movement. It is a period of joyful discovery on our pre-school campus.', 
   '/Newsletter/26February2026_img_p4_1.jpeg', '{"gallery": ["/Newsletter/26February2026_img_p4_1.jpeg", "/Newsletter/26February2026_img_p4_2.jpeg"], "layout": "standard"}', '');


-- 2. Insert the 12 March 2026 Edition
INSERT INTO newsletters (
  id, title, slug, headline, subheadline, term, issue_number, excerpt, highlights, publish_date, is_published
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '12 March 2026 Edition',
  '12-march-2026',
  'The Riverview Reporter',
  'Champions Inspired by Values • Term 1 • Week 9',
  'Term 1',
  'Week 9',
  'A period of profound reflection and anticipation as we approach the cultural highlight of our term.',
  '["School Play Buzz", "Winter Sport Kickoff", "Carpark Evolution"]',
  '2026-03-12',
  true
);

-- Insert blocks for 12 March Edition
INSERT INTO newsletter_sections (
  newsletter_id, title, sort_order, section_type, body, image_url, extra_data, author
) VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'From the Headmaster’s Desk', 0, 'head', 
   'As we approach the penultimate week of Term 1, I find myself reflecting on the remarkable journey we have shared. Our campus is alive with anticipation for our school play, which has truly captured the spirit of our community. Seeing our students and staff united in their dedication to this cultural milestone is a testament to the values we hold dear at Riverview. Beyond the stage, our winter sports season has commenced with exceptional vigor, offering our children every opportunity for physical and social development.', 
   '/Newsletter/12 March 2026_img_p1_1.png', '{"gallery": ["/Newsletter/12 March 2026_img_p1_1.png"], "layout": "magazine"}', 'Murray Johnson'),

  ('b0000000-0000-0000-0000-000000000001', 'Upcoming Engagements', 1, 'dates', '', '', 
   '{"items": [
     {"date": "16 Mar", "title": "SP Afternoon Parent Interviews", "detail": "Scheduled from 15:00 to 17:00"},
     {"date": "17 Mar", "title": "Curro Educational Discourse", "detail": "Tailored for our Grade 6 & 7 students"},
     {"date": "18 Mar", "title": "Mid-week Rugby Festival", "detail": "Hosted at Curro Nelspruit"},
     {"date": "19 Mar", "title": "School Portraits", "detail": "Full academic uniform is required"},
     {"date": "20 Mar", "title": "Regional Sport Meet", "detail": "Netball and Rugby hosted at Uplands"}
   ], "layout": "standard"}', ''),

  ('b0000000-0000-0000-0000-000000000001', 'Selati Fun Run 2026 Invitation', 2, 'content', 
   'Riverview Preparatory is proud to once again support our community fun run. We encourage our families to participate in this vibrant town event. Please ensure all entries are processed through our main office by the 16th of March. We look forward to seeing our students represent the school in their Riverview Greens.', 
   '/Newsletter/12 March 2026_img_p2_1.jpeg', '{"gallery": ["/Newsletter/12 March 2026_img_p2_1.jpeg", "/Newsletter/12 March 2026_img_p2_2.jpeg"], "layout": "magazine_reverse"}', ''),

  ('b0000000-0000-0000-0000-000000000001', 'Exceptional Sporting Prowess', 3, 'sport', 
   'We celebrate Usentele Sibiya for her outstanding silver-medal performance at the Swimming South Africa Level 1 Championships—a true embodiment of sporting excellence. As we look ahead to the upcoming regional festivals, we are confident our teams will continue to uphold our reputation for both skill and sportsmanship.', 
   '/Newsletter/12 March 2026_img_p3_1.jpeg', '{"gallery": ["/Newsletter/12 March 2026_img_p3_1.jpeg", "/Newsletter/12 March 2026_img_p3_2.jpeg"], "layout": "split"}', ''),

  ('b0000000-0000-0000-0000-000000000001', 'Refining Our Learning Environment', 4, 'content', 
   'The ongoing evolution of our school infrastructure represents our steadfast commitment to the safe and professional excellence of our campus. The refined carpark facility is nearly complete, and we believe these improvements will greatly enhance the daily experience for our students and families.', 
   '/Newsletter/12 March 2026_img_p4_1.jpeg', '{"gallery": ["/Newsletter/12 March 2026_img_p4_1.jpeg", "/Newsletter/12 March 2026_img_p4_2.jpeg"], "layout": "hero"}', '');
