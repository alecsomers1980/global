const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ctfwxbrjyxjcdsrbdxxz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNjk2NSwiZXhwIjoyMDkzNTgyOTY1fQ.4fL8QCtMUWElq0cgO6fkbNPwFmhzAndROuSFvAWTDYE'
);

const newsletters = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: '19 March 2026 Edition',
    slug: '19-march-2026',
    headline: 'The Riverview Reporter',
    subheadline: 'Champions Inspired by Values • Term 1 • Week 10',
    term: 'Term 1', issue_number: 'Week 10',
    excerpt: 'Reflecting on a rewarding term as we gear up for Oliver with a Twist performances and the Selati Fun Run.',
    highlights: ["Oliver with a Twist", "Selati Fun Run", "Parent Interviews"],
    publish_date: '2026-03-19', is_published: true,
    hero_image: '/Newsletter/19 March 2026/img_p1_3.jpeg',
    sections: [
      { title: "From the Headmaster's Desk", sort_order: 0, section_type: 'head', author: 'Murray Johnson',
        body: 'We are concluding our second last week of our first term. It has been a very eventful term, filled with many highlights across all aspects of school life. It is also time for us to reflect on the many achievements from our pupils, both in the classroom and on the sports field. These achievements make us proud as staff and naturally, as parents, these achievements of your children, no matter how big or small they may be, are significant milestones in their development as young people. Our school values, as well as our Christian ethos, remain at the core of our school.\n\nOver the past two weeks, our parents have been able to meet with the various class teachers and subject teachers about the progress of their children over this past term. These meetings are always insightful and I must compliment our staff for their dedication and attention to detail around every child in their care.\n\nWe look forward to our school play, Oliver with a Twist, next week. This has certainly been a real highlight for our children and all our staff involved in this production. The excitement around the play on our campus is something quite special. We look forward to your attendance over the three days next week. Culture is such an important offering at any school and we will continue to place emphasis on this at Riverview. Term 2 also promises to be a very eventful term. Enjoy the weekend and see you at the play next week.',
        image_url: '/Newsletter/19 March 2026/img_p1_3.jpeg',
        extra_data: { gallery: ['/Newsletter/19 March 2026/img_p1_3.jpeg'], layout: 'magazine' } },
      { title: 'Key Calendar Dates', sort_order: 1, section_type: 'dates', body: '', image_url: '',
        extra_data: { items: [
          { date: '19 Mar', title: 'School Photo Day', detail: 'Full academic uniform required' },
          { date: '20 Mar', title: 'U10-Open Netball & Rugby', detail: 'Festival hosted at Uplands' },
          { date: '24 Mar', title: 'Oliver with a Twist', detail: 'General seating — R80 per person' },
          { date: '25 Mar', title: 'Oliver with a Twist', detail: 'Dinner evening — R280 per person' },
          { date: '26 Mar', title: 'Oliver with a Twist', detail: 'General seating — R80 per person' },
          { date: '27 Mar', title: 'School Closes', detail: '10h00 — End of Term 1' }
        ], layout: 'standard' }, author: '' },
      { title: 'Selati Fun Run 2026', sort_order: 2, section_type: 'content',
        body: 'Last entries for the Selati Fun Run can be handed into the school office. All children running or walking the 2km or 4.9km race must be accompanied by a parent, guardian or adult. An entry form and R60 is required for every participant. All Riverview Prep children will wear their Riverview greens for the Fun Run. This is a fun event for the community.',
        image_url: '/Newsletter/19 March 2026/img_p2_2.jpeg',
        extra_data: { gallery: ['/Newsletter/19 March 2026/img_p2_2.jpeg', '/Newsletter/19 March 2026/img_p2_3.jpeg'], layout: 'magazine_reverse' }, author: '' },
      { title: 'Sporting Highlights', sort_order: 3, section_type: 'sport',
        body: 'This past week we travelled to Curro Nelspruit to play netball and rugby against them. We played against some tough competition, but the children kept their spirits high and played with lots of grit! Bonolo Dibakwane was internally nominated by the Riverview coaches as the man of the match. We look forward to the season with inspirational players like him.',
        image_url: '/Newsletter/19 March 2026/img_p2_4.jpeg',
        extra_data: { gallery: ['/Newsletter/19 March 2026/img_p2_4.jpeg', '/Newsletter/19 March 2026/img_p2_5.jpeg'], layout: 'split' }, author: '' },
      { title: 'Pre-School Explorations', sort_order: 4, section_type: 'preschool',
        body: 'This week our Cubs had a delightful time decorating cupcakes. With frosting, sprinkles, and plenty of imagination, each child turned a simple treat into a colorful masterpiece. Beyond the fun, this activity encouraged creativity and fine motor skills. The Grade 000 children are having so much fun exploring numbers through play-based activities and games. Puzzle time is a favourite for the Grade 0 children.',
        image_url: '/Newsletter/19 March 2026/img_p3_2.jpeg',
        extra_data: { gallery: ['/Newsletter/19 March 2026/img_p3_2.jpeg', '/Newsletter/19 March 2026/img_p3_3.jpeg', '/Newsletter/19 March 2026/img_p3_4.jpeg'], layout: 'standard' }, author: '' },
    ]
  },
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    title: '27 March 2026 Edition',
    slug: '27-march-2026',
    headline: 'The Riverview Reporter',
    subheadline: 'Champions Inspired by Values • Term 1 • Week 11',
    term: 'Term 1', issue_number: 'Week 11',
    excerpt: 'A triumphant end to Term 1 with the curtain closing on Oliver with a Twist and celebrations of our talented young soccer stars.',
    highlights: ["Oliver Finale", "Soccer Stars", "Baobab Factory Trip"],
    publish_date: '2026-03-27', is_published: true,
    hero_image: '/Newsletter/27 March 2026/img_p3_1.jpeg',
    sections: [
      { title: "From the Headmaster's Desk", sort_order: 0, section_type: 'head', author: 'Murray Johnson',
        body: "Term 1 has been a very eventful and rewarding term for our pupils and for us as a school. There have been many highlights, from our start of term PA Parents' Braai, to achieving fourth place at the MJ Zwane Athletics Meeting and finally our school play, Oliver with a Twist, which has been showcased this week.\n\nIt has been wonderful to see many of our parents, grandparents and friends of Riverview attend the various shows. A huge thanks must go to Megan Swart and Cally Johnson for their tireless efforts as the play producers this year.\n\nSadly, we say farewell to Megan Swart who has been on our staff for nine years. Megan has certainly left her mark here at Riverview. We wish Megan and her family all the very best for the future. Enjoy the holiday with your families and travel safely.",
        image_url: '/Newsletter/27 March 2026/img_p1_3.jpeg',
        extra_data: { gallery: ['/Newsletter/27 March 2026/img_p1_3.jpeg'], layout: 'magazine' } },
      { title: 'Key Calendar Dates', sort_order: 1, section_type: 'dates', body: '', image_url: '',
        extra_data: { items: [
          { date: '14 Apr', title: 'School Opens', detail: '07h00 — Term 2 begins' },
          { date: '14-16 Apr', title: 'Senior Primary Camp', detail: 'Three Sisters, Lows Creek' },
          { date: '17 Apr', title: 'Camp Return & Mini Festival', detail: 'Netball/Tag Rugby hosted at RPS' }
        ], layout: 'standard' }, author: '' },
      { title: 'Baobab Factory Field Trips', sort_order: 2, section_type: 'content',
        body: "The Grade 7s were privileged to tour the new Baobab Factory right here in Malelane, discussing the production process, inputs, processes and outputs. Our Grade 6s also visited and learned how chicken Polony and Russians are made, discovering strict hygiene rules at every step. Learners returned even more excited about eating Polony and Russians!",
        image_url: '/Newsletter/27 March 2026/img_p2_1.jpeg',
        extra_data: { gallery: ['/Newsletter/27 March 2026/img_p2_1.jpeg', '/Newsletter/27 March 2026/img_p2_2.jpeg'], layout: 'magazine_reverse' }, author: '' },
      { title: 'Soccer Stars Shine', sort_order: 3, section_type: 'sport',
        body: "Riverview soccer stars Mabuthonke Mdhlovu, Masimthembe Sibiya, and Simtholile Zulu were selected to represent Mamelodi Sundowns Soccer School Nelspruit at La Copa tournament at Curro Mbombela. Nelspruit U/7 won the trophy and gold medals. Nelspruit U/9 finished second. Nelspruit U/11 also finished second after losing to TS Galaxy in penalties. We are extremely proud of our young soccer stars!",
        image_url: '/Newsletter/27 March 2026/img_p3_3.jpeg',
        extra_data: { gallery: ['/Newsletter/27 March 2026/img_p3_3.jpeg', '/Newsletter/27 March 2026/img_p3_4.jpeg'], layout: 'split' }, author: '' },
      { title: 'Oliver with a Twist — Curtain Call', sort_order: 4, section_type: 'event',
        body: 'Last night marked our final performance and what a way to end the term. With the curtain closing on a fantastic show, we are heading into the holidays feeling proud and excited. After weeks of hard work and rehearsals, the show was a huge success, full of laughter, music, dancing and amazing performances.',
        image_url: '/Newsletter/27 March 2026/img_p3_1.jpeg',
        extra_data: { gallery: ['/Newsletter/27 March 2026/img_p3_1.jpeg', '/Newsletter/27 March 2026/img_p3_6.jpeg'], subtitle: 'A spectacular end to Term 1', layout: 'hero' }, author: '' },
      { title: 'Pre-School Explorations', sort_order: 5, section_type: 'preschool',
        body: "We are delighted to share that our Cubs class now has a beautiful new doll house lovingly handcrafted by Doug Tapson. Grade 00 class engaging in STEM activities this week — creating bridges and developing communication skills. Grade 0s enjoyed Easter Crafts.",
        image_url: '/Newsletter/27 March 2026/img_p4_2.jpeg',
        extra_data: { gallery: ['/Newsletter/27 March 2026/img_p4_2.jpeg', '/Newsletter/27 March 2026/img_p4_3.jpeg'], layout: 'standard' }, author: '' },
    ]
  },
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    title: '16 April 2026 Edition',
    slug: '16-april-2026',
    headline: 'The Riverview Reporter',
    subheadline: 'Champions Inspired by Values • Term 2 • Week 1',
    term: 'Term 2', issue_number: 'Week 1',
    excerpt: 'Welcome back to Term 2! Senior Primary camp kicks off at Three Sisters, rugby poles go up for the first time, and our first home sports festival approaches.',
    highlights: ["Senior Primary Camp", "Rugby Poles Erected", "Home Festival"],
    publish_date: '2026-04-16', is_published: true,
    hero_image: '/Newsletter/16 April 2026/img_p3_1.jpeg',
    sections: [
      { title: "From the Headmaster's Desk", sort_order: 0, section_type: 'head', author: 'Murray Johnson',
        body: "Welcome back to Term 2! Tuesday morning was a hive of activity as our senior primary children headed off to Three Sisters, a camp venue near Low's Creek. I was hugely impressed with the beautiful venue and the quality of the instructors.\n\nThis Friday we host our first sports festival of the term. Our rugby posts were erected over the holidays and our new rugby jerseys arrived — both significant milestones and firsts for our school. Academically, our standardised tests commence next week.\n\n\"Education is not the filling of a pail, but the lighting of a fire\" — William Butler Yeats. Enjoy the weekend.",
        image_url: '/Newsletter/16 April 2026/img_p3_1.jpeg',
        extra_data: { gallery: ['/Newsletter/16 April 2026/img_p3_1.jpeg'], layout: 'magazine' } },
      { title: 'Key Calendar Dates', sort_order: 1, section_type: 'dates', body: '', image_url: '',
        extra_data: { items: [
          { date: '17 Apr', title: 'Mini Netball & Tag Rugby Festival', detail: 'Hosted at RPS' },
          { date: '20-24 Apr', title: 'Standardised Tests', detail: 'Grade 4-7 — Natural Science' },
          { date: '21 Apr', title: 'U9-Open Netball & Rugby', detail: 'Away at Penryn' },
          { date: '25 Apr', title: 'Netball Clinic', detail: 'Hosted at RPS' }
        ], layout: 'standard' }, author: '' },
      { title: 'Sports Update — Historic Rugby Milestone', sort_order: 2, section_type: 'sport',
        body: 'We are excited to announce that our long-awaited rugby poles have been raised. This is an historic event for Riverview Prep School. We have our first mini netball and tag-rugby festival coming up on home soil. We invite all parents to attend. Food will be on sale from the tuck shop, and we are hosting Curro Nelspruit, Curro Mbombela, Uplands, Penryn, and Komatipoort Akademie.',
        image_url: '/Newsletter/16 April 2026/img_p2_1.png',
        extra_data: { gallery: ['/Newsletter/16 April 2026/img_p2_1.png', '/Newsletter/16 April 2026/img_p2_2.png'], layout: 'hero' }, author: '' },
      { title: 'Pre-School Explorations', sort_order: 3, section_type: 'preschool',
        body: "The Cubs are kicking off the new term with a fascinating topic — bats! Did you know bats eat lots of mosquitoes? Grade 000 are exploring Autumn this week. Outdoor play is vital for children's growth. Grade 0s are having a wonderful time playing and creating with the new equipment.",
        image_url: '/Newsletter/16 April 2026/img_p5_2.jpeg',
        extra_data: { gallery: ['/Newsletter/16 April 2026/img_p5_2.jpeg', '/Newsletter/16 April 2026/img_p5_3.jpeg', '/Newsletter/16 April 2026/img_p6_1.jpeg'], layout: 'standard' }, author: '' },
    ]
  },
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    title: '23 April 2026 Edition',
    slug: '23-april-2026',
    headline: 'The Riverview Reporter',
    subheadline: 'Champions Inspired by Values • Term 2 • Week 2',
    term: 'Term 2', issue_number: 'Week 2',
    excerpt: 'A packed second week with our first home sports festival, Three Sisters camp reflections, Earth Day celebrations and Golf Day planning underway.',
    highlights: ["Home Festival Success", "Three Sisters Camp", "Golf Day Planning"],
    publish_date: '2026-04-23', is_published: true,
    hero_image: '/Newsletter/23 April 2026/img_p2_3.jpeg',
    sections: [
      { title: "From the Headmaster's Desk", sort_order: 0, section_type: 'head', author: 'Murray Johnson',
        body: "We had a good first week back at school! Our senior primary pupils enjoyed an excellent outdoor camp at Three Sisters and have returned with enthusiasm.\n\nOur first week concluded with a wonderful sports festival of tag rugby and mini netball. It was a great afternoon of sport and camaraderie. Our campus and facilities were in perfect condition.\n\nWe are also busy planning for our school golf day on Saturday 25th July at the Malelane Golf Club. There are still golf 4-balls and hole sponsorship opportunities available.\n\n\"Success in this game depends less on strength of body than strength of mind and character\" — Arnold Palmer. Enjoy the long weekend with your families.",
        image_url: '/Newsletter/23 April 2026/img_p2_3.jpeg',
        extra_data: { gallery: ['/Newsletter/23 April 2026/img_p2_3.jpeg'], layout: 'magazine' } },
      { title: 'Key Calendar Dates', sort_order: 1, section_type: 'dates', body: '', image_url: '',
        extra_data: { items: [
          { date: '25 Apr', title: 'Netball Clinic', detail: 'Hosted at RPS — 180+ pupils expected' },
          { date: '27 Apr', title: 'Freedom Day', detail: 'Public Holiday' },
          { date: '28-30 Apr', title: 'Standardised Tests', detail: 'Grade 4-7 — Social Science' },
          { date: '01 May', title: "Workers' Day", detail: 'Public Holiday' },
          { date: '08 May', title: "JP & Preschool Mother's Morning", detail: 'A special morning for moms' },
          { date: '09 May', title: 'Selati Marathon', detail: 'Malelane Rugby Club' }
        ], layout: 'standard' }, author: '' },
      { title: 'Sports Festival Success', sort_order: 2, section_type: 'sport',
        body: 'We hosted our first mini-netball and tag-rugby festival. Penryn, Uplands, Curro Nelspruit, Curro Mbombela and Komatipoort Akademie joined us. Pizza Perfect sponsored lunches. In other news, Sphiwosethu Mkhatshwa (Grade 2) participated in a gala hosted by St. Peters — congratulations on his medals!',
        image_url: '/Newsletter/23 April 2026/img_p2_1.jpeg',
        extra_data: { gallery: ['/Newsletter/23 April 2026/img_p2_1.jpeg', '/Newsletter/23 April 2026/img_p2_2.jpeg'], layout: 'split' }, author: '' },
      { title: 'Senior Primary Camp — Three Sisters Reflections', sort_order: 3, section_type: 'event',
        body: "The Senior Primary children had a truly memorable experience at Three Sisters Camp. The ANTs facilitators were outstanding, offering mapwork and orienteering, biodiversity learning, obstacle courses, archery, and spear throwing. Evenings included a talent show and campfire under the starry sky.\n\nSome children shared: \"Making friends, learning to be independent, realising that I can be a leader, responsibility, teamwork, and having fun.\" Thank you to the staff and parents.",
        image_url: '/Newsletter/23 April 2026/img_p3_3.jpeg',
        extra_data: { gallery: ['/Newsletter/23 April 2026/img_p3_3.jpeg', '/Newsletter/23 April 2026/img_p3_9.jpeg', '/Newsletter/23 April 2026/img_p3_11.jpeg'], subtitle: 'A week of growth and adventure at Three Sisters', layout: 'hero' }, author: '' },
      { title: 'Pre-School Explorations', sort_order: 4, section_type: 'preschool',
        body: "April showers bring curious minds! Writing numbers builds fine motor skills and early number sense. The Cubs had fun learning through play. Grade 0s are learning to play cooperatively during outdoor time, willingly sharing equipment and playing happily together with their peers.",
        image_url: '/Newsletter/23 April 2026/img_p4_2.jpeg',
        extra_data: { gallery: ['/Newsletter/23 April 2026/img_p4_2.jpeg', '/Newsletter/23 April 2026/img_p4_3.jpeg', '/Newsletter/23 April 2026/img_p5_2.jpeg'], layout: 'standard' }, author: '' },
    ]
  }
];

async function seed() {
  // Clean up first
  const slugs = newsletters.map(n => n.slug);
  console.log('Cleaning up existing entries for:', slugs.join(', '));
  
  // Get IDs to delete sections first
  const { data: existing } = await supabase.from('newsletters').select('id').in('slug', slugs);
  if (existing && existing.length > 0) {
    const ids = existing.map(e => e.id);
    await supabase.from('newsletter_sections').delete().in('newsletter_id', ids);
    await supabase.from('newsletters').delete().in('slug', slugs);
    console.log('Cleaned up', existing.length, 'existing newsletters');
  }

  for (const nl of newsletters) {
    const sections = nl.sections;
    const nlData = { ...nl };
    delete nlData.sections;
    
    console.log(`\nInserting: ${nl.title}...`);
    const { data, error } = await supabase.from('newsletters').insert(nlData).select('id').single();
    if (error) {
      console.error('  ERROR inserting newsletter:', error.message);
      continue;
    }
    console.log(`  Newsletter inserted with ID: ${data.id}`);
    
    // Insert sections
    const sectionRows = sections.map(s => ({
      newsletter_id: data.id,
      title: s.title,
      sort_order: s.sort_order,
      section_type: s.section_type,
      body: s.body,
      image_url: s.image_url,
      extra_data: s.extra_data,
      author: s.author || null
    }));
    
    const { error: secErr } = await supabase.from('newsletter_sections').insert(sectionRows);
    if (secErr) {
      console.error('  ERROR inserting sections:', secErr.message);
    } else {
      console.log(`  ${sectionRows.length} sections inserted`);
    }
  }
  
  // Verify
  const { data: all } = await supabase.from('newsletters').select('slug, title').order('publish_date', { ascending: false });
  console.log('\n=== ALL NEWSLETTERS IN DATABASE ===');
  all?.forEach(n => console.log(`  ${n.slug} — ${n.title}`));
  console.log(`\nTotal: ${all?.length} newsletters`);
}

seed().catch(console.error);
