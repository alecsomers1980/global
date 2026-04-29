-- ====================================================================
-- SEED SCRIPT: 4 NEW NEWSLETTERS (19 Mar, 27 Mar, 16 Apr, 23 Apr 2026)
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Clean up any previous attempts
DELETE FROM newsletter_sections WHERE newsletter_id IN (
  SELECT id FROM newsletters WHERE slug IN (
    '19-march-2026','27-march-2026','16-april-2026','23-april-2026'
  )
);
DELETE FROM newsletters WHERE slug IN (
  '19-march-2026','27-march-2026','16-april-2026','23-april-2026'
);

-- ═══════════════════════════════════════════════════════════════
-- 1. 19 MARCH 2026 — Term 1, Week 10
-- ═══════════════════════════════════════════════════════════════
INSERT INTO newsletters (
  id, title, slug, headline, subheadline, term, issue_number,
  excerpt, highlights, publish_date, is_published, hero_image
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  '19 March 2026 Edition',
  '19-march-2026',
  'The Riverview Reporter',
  'Champions Inspired by Values • Term 1 • Week 10',
  'Term 1',
  'Week 10',
  'Reflecting on a rewarding term as we gear up for Oliver with a Twist performances and the Selati Fun Run.',
  '["Oliver with a Twist", "Selati Fun Run", "Parent Interviews"]',
  '2026-03-19',
  true,
  '/Newsletter/19 March 2026/img_p1_3.jpeg'
);

INSERT INTO newsletter_sections (
  newsletter_id, title, sort_order, section_type, body, image_url, extra_data, author
) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'From the Headmaster''s Desk', 0, 'head',
   'We are concluding our second last week of our first term. It has been a very eventful term, filled with many highlights across all aspects of school life. It is also time for us to reflect on the many achievements from our pupils, both in the classroom and on the sports field. These achievements make us proud as staff and naturally, as parents, these achievements of your children, no matter how big or small they may be, are significant milestones in their development as young people. Our school values, as well as our Christian ethos, remain at the core of our school.

Over the past two weeks, our parents have been able to meet with the various class teachers and subject teachers about the progress of their children over this past term. These meetings are always insightful and I must compliment our staff for their dedication and attention to detail around every child in their care.

We look forward to our school play, Oliver with a Twist, next week. This has certainly been a real highlight for our children and all our staff involved in this production. The excitement around the play on our campus is something quite special. We look forward to your attendance over the three days next week. Culture is such an important offering at any school and we will continue to place emphasis on this at Riverview. Term 2 also promises to be a very eventful term. Enjoy the weekend and see you at the play next week.',
   '/Newsletter/19 March 2026/img_p1_3.jpeg',
   '{"gallery": ["/Newsletter/19 March 2026/img_p1_3.jpeg"], "layout": "magazine"}',
   'Murray Johnson'),

  ('c0000000-0000-0000-0000-000000000001', 'Key Calendar Dates', 1, 'dates', '', '',
   '{"items": [
     {"date": "19 Mar", "title": "School Photo Day", "detail": "Full academic uniform required"},
     {"date": "20 Mar", "title": "U10-Open Netball & Rugby", "detail": "Festival hosted at Uplands"},
     {"date": "24 Mar", "title": "Oliver with a Twist", "detail": "General seating — R80 per person"},
     {"date": "25 Mar", "title": "Oliver with a Twist", "detail": "Dinner evening — R280 per person"},
     {"date": "26 Mar", "title": "Oliver with a Twist", "detail": "General seating — R80 per person"},
     {"date": "27 Mar", "title": "School Closes", "detail": "10h00 — End of Term 1"}
   ], "layout": "standard"}', ''),

  ('c0000000-0000-0000-0000-000000000001', 'Selati Fun Run 2026', 2, 'content',
   'Last entries for the Selati Fun Run can be handed into the school office. If you would like to enter but can only pay after the 25th, please fill in the entry forms and send to the office so entries can be captured. Payment can be made to Mrs Rutherford by the end of this term. All children running or walking the 2km or 4.9km race must be accompanied by a parent, guardian or adult. An entry form and R60 is required for every participant. All Riverview Prep children will wear their Riverview greens for the Fun Run. This is a fun event for the community — please ensure your entries are handed in as soon as possible.',
   '/Newsletter/19 March 2026/img_p2_2.jpeg',
   '{"gallery": ["/Newsletter/19 March 2026/img_p2_2.jpeg", "/Newsletter/19 March 2026/img_p2_3.jpeg"], "layout": "magazine_reverse"}', ''),

  ('c0000000-0000-0000-0000-000000000001', 'Sporting Highlights', 3, 'sport',
   'This past week we travelled to Curro Nelspruit to play netball and rugby against them. We played against some tough competition, but the children kept their spirits high and played with lots of grit! Bonolo Dibakwane was internally nominated by the Riverview coaches as the man of the match. We look forward to the season with inspirational players like him. On Friday 20 March, we will travel to Uplands to play in their netball and rugby festival.',
   '/Newsletter/19 March 2026/img_p2_4.jpeg',
   '{"gallery": ["/Newsletter/19 March 2026/img_p2_4.jpeg", "/Newsletter/19 March 2026/img_p2_5.jpeg"], "layout": "split"}', ''),

  ('c0000000-0000-0000-0000-000000000001', 'Senior Primary Camp Reminder', 4, 'content',
   'The Senior Primary are reminded of their camp from the first day back at school next term and what to pack. Outdoor school is not only fun but a great learning experience not to be missed! Please note that a small day backpack will be useful to bring along.',
   '/Newsletter/19 March 2026/img_p2_3.jpeg',
   '{"gallery": ["/Newsletter/19 March 2026/img_p2_3.jpeg"], "layout": "standard"}', ''),

  ('c0000000-0000-0000-0000-000000000001', 'Pre-School Explorations', 5, 'preschool',
   'This week our Cubs had a delightful time decorating cupcakes. With frosting, sprinkles, and plenty of imagination, each child turned a simple treat into a colorful masterpiece. Beyond the fun, this activity encouraged creativity and fine motor skills. It was a joyful way to combine learning with a little sweetness! The Grade 000 children are having so much fun exploring numbers through play-based activities and games. Puzzle time is a favourite for the Grade 0 children.',
   '/Newsletter/19 March 2026/img_p3_2.jpeg',
   '{"gallery": ["/Newsletter/19 March 2026/img_p3_2.jpeg", "/Newsletter/19 March 2026/img_p3_3.jpeg", "/Newsletter/19 March 2026/img_p3_4.jpeg"], "layout": "standard"}', '');


-- ═══════════════════════════════════════════════════════════════
-- 2. 27 MARCH 2026 — Term 1, Week 11
-- ═══════════════════════════════════════════════════════════════
INSERT INTO newsletters (
  id, title, slug, headline, subheadline, term, issue_number,
  excerpt, highlights, publish_date, is_published, hero_image
) VALUES (
  'd0000000-0000-0000-0000-000000000001',
  '27 March 2026 Edition',
  '27-march-2026',
  'The Riverview Reporter',
  'Champions Inspired by Values • Term 1 • Week 11',
  'Term 1',
  'Week 11',
  'A triumphant end to Term 1 with the curtain closing on Oliver with a Twist and celebrations of our talented young soccer stars.',
  '["Oliver Finale", "Soccer Stars", "Baobab Factory Trip"]',
  '2026-03-27',
  true,
  '/Newsletter/27 March 2026/img_p3_1.jpeg'
);

INSERT INTO newsletter_sections (
  newsletter_id, title, sort_order, section_type, body, image_url, extra_data, author
) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'From the Headmaster''s Desk', 0, 'head',
   'Term 1 has been a very eventful and rewarding term for our pupils and for us as a school. There have been many highlights, from our start of term PA Parents'' Braai, to achieving fourth place at the MJ Zwane Athletics Meeting for independent schools in Nelspruit and finally our school play, Oliver with a Twist, which has been showcased this week.

It has been wonderful to see many of our parents, grandparents and friends of Riverview attend the various shows this week. Our school certainly has talented children and I have no doubt that this event will be etched in their memories for many years to come. A huge thanks must go to Megan Swart and Cally Johnson for their tireless efforts as the play producers this year.

Sadly, we say farewell to Megan Swart who has been on our staff for nine years. Megan has certainly left her mark here at Riverview and her passion for education and the love for the children in her care are clear for all to see. We wish Megan and her family all the very best for the future.

To conclude, may we continue to strive for success at Riverview in all that we do. The three essential elements to achieve this are responsibility, commitment and excellence. Enjoy the holiday with your families and travel safely.',
   '/Newsletter/27 March 2026/img_p1_3.jpeg',
   '{"gallery": ["/Newsletter/27 March 2026/img_p1_3.jpeg"], "layout": "magazine"}',
   'Murray Johnson'),

  ('d0000000-0000-0000-0000-000000000001', 'Key Calendar Dates', 1, 'dates', '', '',
   '{"items": [
     {"date": "14 Apr", "title": "School Opens", "detail": "07h00 — Term 2 begins"},
     {"date": "14-16 Apr", "title": "Senior Primary Camp", "detail": "Three Sisters, Lows Creek"},
     {"date": "17 Apr", "title": "Camp Return & Mini Netball/Tag Rugby", "detail": "Festival hosted at RPS"}
   ], "layout": "standard"}', ''),

  ('d0000000-0000-0000-0000-000000000001', 'Baobab Factory Field Trips', 2, 'content',
   'The Grade 7s were privileged to tour the new Baobab Factory right here in Malelane. We finished our EMS curriculum discussing the production process, inputs, processes and outputs. We talked about safety, legislation and technology and how all of these things impact effective and efficient manufacturing of goods. Marc, the Baobab Manager, did an excellent tour. We would like to thank Marc and his team, as well as Mr Lex Hollman for the opportunity.

Our Grade 6s also visited the Baobab Sausage Factory in Malelane, where they learned exactly how chicken Polony and Russians are made. They watched the production process and discovered the strict hygiene rules followed at every step. The trip highlighted the importance of handwashing, proper PPE, and safety protocols. Learners returned to school even more excited about eating Polony and Russians!',
   '/Newsletter/27 March 2026/img_p2_1.jpeg',
   '{"gallery": ["/Newsletter/27 March 2026/img_p2_1.jpeg", "/Newsletter/27 March 2026/img_p2_2.jpeg", "/Newsletter/27 March 2026/img_p2_3.jpeg"], "layout": "magazine_reverse"}', ''),

  ('d0000000-0000-0000-0000-000000000001', 'Mathematics Challenge', 3, 'content',
   'The annual South African Mathematics Challenge (SAMC 2026) has come around again. Round 1 included a collaborative paper where the pupils worked in pairs. We are very proud of the following Grade 5 pupils who have made it through to Round 2: Phiwokuhle Nsingwane and Luthando Nzimande; Mukhethwa Bereda and Donovan Chance. The SAMC will be an individual effort from Round 2.',
   '/Newsletter/27 March 2026/img_p2_6.jpeg',
   '{"gallery": ["/Newsletter/27 March 2026/img_p2_6.jpeg"], "layout": "standard"}', ''),

  ('d0000000-0000-0000-0000-000000000001', 'Soccer Stars Shine', 4, 'sport',
   'Riverview soccer star pupils Mabuthonke Mdhlovu, Masimthembe Sibiya, and Simtholile Zulu were selected to represent Mamelodi Sundowns Soccer School Nelspruit at La Copa tournament held at Curro Mbombela on 21 March 2026. Nelspruit U/7 (Masimthembe''s team) won the trophy and secured gold medals. Nelspruit U/9 (Simtholile''s team) finished second after losing to Witbank in the final. Nelspruit U/11 (Mabuthonke''s team) finished second after losing to TS Galaxy in penalties. We are extremely proud of our young soccer stars!',
   '/Newsletter/27 March 2026/img_p3_3.jpeg',
   '{"gallery": ["/Newsletter/27 March 2026/img_p3_3.jpeg", "/Newsletter/27 March 2026/img_p3_4.jpeg", "/Newsletter/27 March 2026/img_p3_5.jpeg"], "layout": "split"}', ''),

  ('d0000000-0000-0000-0000-000000000001', 'Oliver with a Twist — Curtain Call', 5, 'event',
   'Last night marked our final performance and what a way to end the term. With the curtain closing on a fantastic show, we are heading into the holidays feeling proud and excited. After weeks of hard work and rehearsals, the show was a huge success, full of laughter, music, dancing and amazing performances. Our pupils have really showcased their talent and both staff and pupils are to be thanked for their efforts.',
   '/Newsletter/27 March 2026/img_p3_1.jpeg',
   '{"gallery": ["/Newsletter/27 March 2026/img_p3_1.jpeg", "/Newsletter/27 March 2026/img_p3_6.jpeg", "/Newsletter/27 March 2026/img_p3_7.jpeg"], "subtitle": "A spectacular end to Term 1", "layout": "hero"}', ''),

  ('d0000000-0000-0000-0000-000000000001', 'Pre-School Explorations', 6, 'preschool',
   'We are delighted to share that our Cubs class now has a beautiful new doll house lovingly handcrafted by Doug Tapson. Thank you, Doug, for your generosity and skill — this special gift will spark imaginative play, sharing and warm smiles. Grade 00 class engaging in some STEM activities this week — creating bridges and developing communication skills and creativity. Grade 0s enjoyed Easter Crafts.',
   '/Newsletter/27 March 2026/img_p4_2.jpeg',
   '{"gallery": ["/Newsletter/27 March 2026/img_p4_2.jpeg", "/Newsletter/27 March 2026/img_p4_3.jpeg", "/Newsletter/27 March 2026/img_p4_4.jpeg"], "layout": "standard"}', '');


-- ═══════════════════════════════════════════════════════════════
-- 3. 16 APRIL 2026 — Term 2, Week 1
-- ═══════════════════════════════════════════════════════════════
INSERT INTO newsletters (
  id, title, slug, headline, subheadline, term, issue_number,
  excerpt, highlights, publish_date, is_published, hero_image
) VALUES (
  'e0000000-0000-0000-0000-000000000001',
  '16 April 2026 Edition',
  '16-april-2026',
  'The Riverview Reporter',
  'Champions Inspired by Values • Term 2 • Week 1',
  'Term 2',
  'Week 1',
  'Welcome back to Term 2! Senior Primary camp kicks off at Three Sisters, rugby poles go up for the first time, and our first home sports festival approaches.',
  '["Senior Primary Camp", "Rugby Poles Erected", "Home Festival"]',
  '2026-04-16',
  true,
  '/Newsletter/16 April 2026/img_p3_1.jpeg'
);

INSERT INTO newsletter_sections (
  newsletter_id, title, sort_order, section_type, body, image_url, extra_data, author
) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'From the Headmaster''s Desk', 0, 'head',
   'Welcome back to Term 2! I trust you had a good break with your children over the Easter holidays and are looking forward to an exciting term ahead. Tuesday morning was a hive of activity as our senior primary children headed off to Three Sisters, a camp venue near Low''s Creek, on their annual outdoor camp. I had the privilege of spending the day out at camp yesterday and was hugely impressed with the beautiful venue and accommodation and more importantly the quality of the instructors.

The children were divided into groups on Day 1 and then form a special bond for the duration of camp, with the emphasis on teamwork in all activities. Outdoor camps play a critical role in the development of young people and acquiring the necessary life skills in a different environment.

This Friday we host our first sports festival of the term and it promises to be a great afternoon. You would have seen that our rugby posts were erected over the holidays and our new rugby jerseys arrived this week too. These are both significant milestones and firsts for our school. Academically, our standardised tests commence next week.

"Education is not the filling of a pail, but the lighting of a fire" — William Butler Yeats. Enjoy the weekend.',
   '/Newsletter/16 April 2026/img_p3_1.jpeg',
   '{"gallery": ["/Newsletter/16 April 2026/img_p3_1.jpeg"], "layout": "magazine"}',
   'Murray Johnson'),

  ('e0000000-0000-0000-0000-000000000001', 'Key Calendar Dates', 1, 'dates', '', '',
   '{"items": [
     {"date": "17 Apr", "title": "Mini Netball u7-u9 & Tag Rugby u7-u8", "detail": "Festival hosted at RPS"},
     {"date": "20-24 Apr", "title": "Standardised Tests", "detail": "Grade 4-7 — Natural Science"},
     {"date": "21 Apr", "title": "U9-Open Netball & Rugby", "detail": "Away at Penryn"},
     {"date": "23 Apr", "title": "U7/8 Netball @ Penryn / Rugby @ Ls Malelane", "detail": "Multiple fixtures"},
     {"date": "25 Apr", "title": "Netball Clinic", "detail": "Hosted at RPS"}
   ], "layout": "standard"}', ''),

  ('e0000000-0000-0000-0000-000000000001', 'Sports Update — Historic Rugby Milestone', 2, 'sport',
   'A warm welcome from the Sport Office to all parents and pupils. We are excited to announce that our long-awaited rugby poles have been raised. This is an historic event for Riverview Prep School. We cannot wait to practise our skills and get our rugby on the map. We have our first mini netball and tag-rugby festival coming up on home soil. We invite all parents and pupils to attend and support our festival. Food will be on sale from the tuck shop, and we are excited to host Curro Nelspruit, Curro Mbombela, Uplands, Penryn, and Komatipoort Akademie. We have a busy term ahead!',
   '/Newsletter/16 April 2026/img_p2_1.png',
   '{"gallery": ["/Newsletter/16 April 2026/img_p2_1.png", "/Newsletter/16 April 2026/img_p2_2.png"], "layout": "hero"}', ''),

  ('e0000000-0000-0000-0000-000000000001', 'Senior Primary Camp — Three Sisters', 3, 'content',
   'Our senior primary children headed off to Three Sisters, a brand new camp venue near Low''s Creek, on their annual outdoor camp. The emphasis is on teamwork in all activities. Outdoor camps and the "outdoor classroom" play a critical role in the development of young people and acquiring the necessary life skills in a different environment, away from the classroom.',
   '/Newsletter/16 April 2026/img_p3_2.jpeg',
   '{"gallery": ["/Newsletter/16 April 2026/img_p3_1.jpeg", "/Newsletter/16 April 2026/img_p3_2.jpeg", "/Newsletter/16 April 2026/img_p4_1.jpeg"], "layout": "magazine_reverse"}', ''),

  ('e0000000-0000-0000-0000-000000000001', 'Pre-School Explorations', 4, 'preschool',
   'The Cubs are kicking off the new term with a fascinating topic — bats! Far from being scary, these amazing animals are actually very helpful. Did you know bats eat lots of mosquitoes? They even wrap their wings around themselves like a cozy blanket when they rest. Grade 000 have returned from the holiday excited to play and learn together, exploring Autumn this week. Outdoor play is vital for children''s growth — running, climbing, and exploring build strength, coordination, and healthy physical habits. Grade 0s are having a wonderful time playing and creating with the new equipment bought for the preschool.',
   '/Newsletter/16 April 2026/img_p5_2.jpeg',
   '{"gallery": ["/Newsletter/16 April 2026/img_p5_2.jpeg", "/Newsletter/16 April 2026/img_p5_3.jpeg", "/Newsletter/16 April 2026/img_p6_1.jpeg"], "layout": "standard"}', '');


-- ═══════════════════════════════════════════════════════════════
-- 4. 23 APRIL 2026 — Term 2, Week 2
-- ═══════════════════════════════════════════════════════════════
INSERT INTO newsletters (
  id, title, slug, headline, subheadline, term, issue_number,
  excerpt, highlights, publish_date, is_published, hero_image
) VALUES (
  'f0000000-0000-0000-0000-000000000001',
  '23 April 2026 Edition',
  '23-april-2026',
  'The Riverview Reporter',
  'Champions Inspired by Values • Term 2 • Week 2',
  'Term 2',
  'Week 2',
  'A packed second week with our first home sports festival, Three Sisters camp reflections, Earth Day celebrations and Golf Day planning underway.',
  '["Home Festival Success", "Three Sisters Camp", "Golf Day Planning"]',
  '2026-04-23',
  true,
  '/Newsletter/23 April 2026/img_p2_3.jpeg'
);

INSERT INTO newsletter_sections (
  newsletter_id, title, sort_order, section_type, body, image_url, extra_data, author
) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'From the Headmaster''s Desk', 0, 'head',
   'We had a good first week back at school! Our senior primary pupils enjoyed an excellent outdoor camp at Three Sisters and have returned with enthusiasm after being put through their paces with a variety of team building as well as individual tasks. The feedback from our teachers has been hugely positive.

Our first week concluded with a wonderful sports festival of tag rugby and mini netball which we hosted. It was a great afternoon of sport and camaraderie between all the participating schools. A big thank you must go to our sports department as well as all our dedicated staff and parents. Our campus and facilities were in perfect condition and it was wonderful to show it off. This Saturday we host a netball coaching clinic expecting over 180 pupils.

We are also busy planning in earnest for our school golf day on Saturday 25th July at the Malelane Golf Club. Our PA committee are working very hard behind the scenes. There are still golf 4-balls available as well as hole sponsorship opportunities. Should you be in a position to assist, please contact myself or our Marketing Co-Ordinator, Bongiwe Masilela.

"Success in this game depends less on strength of body than strength of mind and character" — Arnold Palmer. Enjoy the long weekend with your families.',
   '/Newsletter/23 April 2026/img_p2_3.jpeg',
   '{"gallery": ["/Newsletter/23 April 2026/img_p2_3.jpeg"], "layout": "magazine"}',
   'Murray Johnson'),

  ('f0000000-0000-0000-0000-000000000001', 'Key Calendar Dates', 1, 'dates', '', '',
   '{"items": [
     {"date": "25 Apr", "title": "Netball Clinic", "detail": "Hosted at RPS — 180+ pupils expected"},
     {"date": "27 Apr", "title": "Freedom Day", "detail": "Public Holiday"},
     {"date": "28-30 Apr", "title": "Standardised Tests", "detail": "Grade 4-7 — Social Science"},
     {"date": "01 May", "title": "Workers Day", "detail": "Public Holiday"},
     {"date": "08 May", "title": "JP & Preschool Mothers Morning", "detail": "A special morning for moms"},
     {"date": "09 May", "title": "Selati Marathon", "detail": "Malelane Rugby Club"}
   ], "layout": "standard"}', ''),

  ('f0000000-0000-0000-0000-000000000001', 'Sports Festival Success', 2, 'sport',
   'We had a busy start to the term. We hosted our first mini-netball and tag-rugby festival. Penryn, Uplands, Curro Nelspruit, Curro Mbombela and Komatipoort Akademie joined us for the afternoon. Pizza Perfect sponsored our lunches for the day. We are looking forward to hosting this festival on a yearly basis. In other news, Sphiwosethu Mkhatshwa (Grade 2) participated in a gala hosted by St. Peters — we congratulate him on his medals and look forward to seeing him develop in the pool.',
   '/Newsletter/23 April 2026/img_p2_1.jpeg',
   '{"gallery": ["/Newsletter/23 April 2026/img_p2_1.jpeg", "/Newsletter/23 April 2026/img_p2_2.jpeg", "/Newsletter/23 April 2026/img_p2_5.jpeg"], "layout": "split"}', ''),

  ('f0000000-0000-0000-0000-000000000001', 'Earth Day Celebrations', 3, 'content',
   'Earth Day, 22 April 2026, was celebrated in Grade 2. The children discussed the Earth, its importance, and how to take care of it. They also made creative Earth Day crowns. Well done, Grade 2s!',
   '/Newsletter/23 April 2026/img_p2_8.jpeg',
   '{"gallery": ["/Newsletter/23 April 2026/img_p2_8.jpeg", "/Newsletter/23 April 2026/img_p2_9.jpeg"], "layout": "standard"}', ''),

  ('f0000000-0000-0000-0000-000000000001', 'Senior Primary Camp — Three Sisters Reflections', 4, 'event',
   'The Senior Primary children had a truly memorable experience at their annual camp this year. Three Sisters Camp, newly constructed and set in breathtaking natural surroundings, provided the perfect backdrop for a week of learning, growth, and fun. The ANTs facilitators were outstanding, offering activities such as mapwork and orienteering, hands-on learning about biodiversity, obstacle courses, archery, and spear throwing.

Evenings were just as special, with opportunities to showcase talents in a lively talent show and to sit around the campfire under the starry night sky. A key focus was developing teamwork and helping each child recognise the valuable role they play within a group. Some of the children shared what they learned: "Making friends, learning to be independent, realising that I can be a leader, responsibility, looking after my own belongings, respecting people, being strong, teamwork, and having fun."

Thank you to the staff who generously gave their time and to the parents for giving them the opportunity to learn and grow in such a beautiful environment.',
   '/Newsletter/23 April 2026/img_p3_3.jpeg',
   '{"gallery": ["/Newsletter/23 April 2026/img_p3_3.jpeg", "/Newsletter/23 April 2026/img_p3_9.jpeg", "/Newsletter/23 April 2026/img_p3_11.jpeg"], "subtitle": "A week of growth and adventure at Three Sisters", "layout": "hero"}', ''),

  ('f0000000-0000-0000-0000-000000000001', 'Pre-School Explorations', 5, 'preschool',
   'April showers bring curious minds! Our preschoolers didn''t let the clouds stop the learning, playing or the smiles. Writing numbers builds fine motor skills, hand-eye coordination, and early number sense. This week, the Cubs had lots of fun learning through play — it helps them learn, grow, and build confidence. Outdoor play gave them time to run, jump, climb, and make their bodies stronger. Grade 0s are learning to play cooperatively in a group situation during outdoor time, willingly sharing equipment and playing happily together with their peers.',
   '/Newsletter/23 April 2026/img_p4_2.jpeg',
   '{"gallery": ["/Newsletter/23 April 2026/img_p4_2.jpeg", "/Newsletter/23 April 2026/img_p4_3.jpeg", "/Newsletter/23 April 2026/img_p5_2.jpeg"], "layout": "standard"}', '');
