import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import https from 'https';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

function dl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.headers.location) return dl(res.headers.location).then(resolve, reject);
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}
const img = (u) => dl(u + '&w=1000&q=80');
const blob = (buf) => new Blob([buf]);

function week(open = '08:00', close = '17:00', sat = '09:00', satClose = '13:00') {
  return {
    mon: { open, close, closed: false },
    tue: { open, close, closed: false },
    wed: { open, close, closed: false },
    thu: { open, close, closed: false },
    fri: { open, close, closed: false },
    sat: { open: sat, close: satClose, closed: false },
    sun: { open: '00:00', close: '00:00', closed: true },
  };
}

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).slice(2, 6);

async function main() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);
  console.log('Authenticated.');

  const SECTOR = { retail: 'buh3h3wg3oz2unw', lodge: 'khpxhtsd1qyureb', auto: '8um2ar5rqvqytkf' };
  const AREA = { town: 'wicu7xltdsnf8y6', acornhoek: 'bq1jm6u6bsm21jo' };

  // ---- demo owner for portal testing ----
  const OWNER_EMAIL = 'demo.owner@dbib.co.za';
  const OWNER_PASS = 'DemoOwner12345';
  let owner;
  try {
    owner = await pb.collection('users').getFirstListItem(`email = "${OWNER_EMAIL}"`);
    console.log('Demo owner exists:', owner.id);
  } catch {
    owner = await pb.collection('users').create({
      email: OWNER_EMAIL, password: OWNER_PASS, passwordConfirm: OWNER_PASS, verified: true, name: 'Demo Owner',
    });
    console.log('Created demo owner:', OWNER_EMAIL, '/', OWNER_PASS);
  }

  // ---- shared images ----
  const [logo1, logo2, logo3, cover2, cover3, g1, g2, g3, g4, g5] = await Promise.all([
    img('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?'),
    img('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?'),
    img('https://images.unsplash.com/photo-1486006920555-c77dcf18193c?'),
    img('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?'),
    img('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?'),
    img('https://images.unsplash.com/photo-1493244040629-496f6d136cc3?'),
    img('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?'),
    img('https://images.unsplash.com/photo-1551218808-94e220e084d2?'),
    img('https://images.unsplash.com/photo-1503376780353-7e6692767b70?'),
    img('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?'),
  ]);

  // ---- 1) BASIC ----
  {
    const fd = new FormData();
    fd.append('name', 'Bushbuckridge Hardware');
    fd.append('sector', SECTOR.retail);
    fd.append('area', AREA.town);
    fd.append('status', 'active');
    fd.append('package_tier', 'basic');
    fd.append('phone', '013 799 1000');
    fd.append('email', 'sales@bbrhardware.co.za');
    fd.append('address', '12 Main Road, Bushbuckridge Town');
    fd.append('description', '<p>Your local supplier of building materials, tools and hardware. Trusted by contractors and households across Bushbuckridge.</p>');
    fd.append('is_verified', 'true');
    fd.append('business_hours', JSON.stringify(week('07:30', '17:00')));
    fd.append('services', JSON.stringify([
      { name: 'Building materials', price: 'POA' },
      { name: 'Power tool hire', price: 'From R150/day' },
      { name: 'Paint mixing', price: 'R50' },
    ]));
    fd.append('logo', blob(logo1), 'logo.jpg');
    const b = await pb.collection('businesses').create(fd);
    console.log('Created BASIC:', b.name);
  }

  // ---- 2) PRO LEAD ----
  let proLead;
  {
    const fd = new FormData();
    fd.append('name', 'Kruger Gateway Lodge');
    fd.append('sector', SECTOR.lodge);
    fd.append('area', AREA.town);
    fd.append('status', 'active');
    fd.append('package_tier', 'pro-lead');
    fd.append('phone', '013 799 2200');
    fd.append('email', 'stay@krugergateway.co.za');
    fd.append('whatsapp', '27821234567');
    fd.append('address', 'R40 Gateway Road, Bushbuckridge');
    fd.append('facebook', 'https://facebook.com/krugergateway');
    fd.append('instagram', 'https://instagram.com/krugergateway');
    fd.append('description', '<p>A warm, family-run lodge minutes from the Kruger National Park. Comfortable rooms, home-cooked meals and guided safari bookings.</p>');
    fd.append('is_verified', 'true');
    fd.append('business_hours', JSON.stringify(week('00:00', '23:59')));
    fd.append('services', JSON.stringify([
      { name: 'Standard room (per night)', price: 'R850' },
      { name: 'Family suite (per night)', price: 'R1 600' },
      { name: 'Guided safari day trip', price: 'R1 200 pp' },
    ]));
    fd.append('logo', blob(logo2), 'logo.jpg');
    fd.append('cover_image', blob(cover2), 'cover.jpg');
    fd.append('gallery', blob(g1), 'g1.jpg');
    fd.append('gallery', blob(g2), 'g2.jpg');
    fd.append('gallery', blob(g3), 'g3.jpg');
    proLead = await pb.collection('businesses').create(fd);
    console.log('Created PRO LEAD:', proLead.name);
  }

  // ---- 3) PRO BUSINESS (owned by demo owner) ----
  let proBiz;
  {
    const fd = new FormData();
    fd.append('name', 'Acornhoek Auto Care');
    fd.append('sector', SECTOR.auto);
    fd.append('area', AREA.acornhoek);
    fd.append('status', 'active');
    fd.append('package_tier', 'pro-business');
    fd.append('owner', owner.id);
    fd.append('phone', '013 795 4400');
    fd.append('email', 'service@acornhoekauto.co.za');
    fd.append('whatsapp', '27829998888');
    fd.append('website', 'https://acornhoekauto.co.za');
    fd.append('address', '45 Industrial Street, Acornhoek');
    fd.append('facebook', 'https://facebook.com/acornhoekauto');
    fd.append('instagram', 'https://instagram.com/acornhoekauto');
    fd.append('linkedin', 'https://linkedin.com/company/acornhoekauto');
    fd.append('description', '<p>Full-service vehicle workshop offering servicing, diagnostics, tyres and panel beating. RMI-accredited technicians and a 12-month workmanship guarantee.</p>');
    fd.append('is_verified', 'true');
    fd.append('is_featured', 'true');
    fd.append('business_hours', JSON.stringify(week('07:00', '17:30')));
    fd.append('services', JSON.stringify([
      { name: 'Minor service', price: 'From R1 200' },
      { name: 'Major service', price: 'From R2 800' },
      { name: 'Computerised diagnostics', price: 'R450' },
      { name: 'Wheel alignment & balancing', price: 'R350' },
    ]));
    fd.append('faqs', JSON.stringify([
      { question: 'Do you offer a courtesy vehicle?', answer: 'Yes, a limited number of courtesy cars are available on request for major services.' },
      { question: 'Are your repairs guaranteed?', answer: 'All workmanship carries a 12-month / 20 000 km guarantee.' },
      { question: 'Do you handle insurance claims?', answer: 'Yes — we are an approved repairer for most major insurers.' },
    ]));
    fd.append('certifications', JSON.stringify(['RMI Accredited', 'CIDB Grade 2', 'BEE Level 1']));
    fd.append('special_offer', 'Free 30-point safety check this June');
    fd.append('special_offer_expires', '2026-07-31');
    fd.append('video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    fd.append('years_in_business', '14');
    fd.append('team_size', '10-20');
    fd.append('map_lat', '-24.5933');
    fd.append('map_lng', '31.1156');
    fd.append('logo', blob(logo3), 'logo.jpg');
    fd.append('cover_image', blob(cover3), 'cover.jpg');
    fd.append('gallery', blob(g2), 'g1.jpg');
    fd.append('gallery', blob(g3), 'g2.jpg');
    fd.append('gallery', blob(g4), 'g3.jpg');
    fd.append('gallery', blob(g5), 'g4.jpg');
    fd.append('gallery', blob(g1), 'g5.jpg');
    proBiz = await pb.collection('businesses').create(fd);
    console.log('Created PRO BUSINESS:', proBiz.name, '(owner: demo.owner@dbib.co.za)');
  }

  // ---- reviews (approved) ----
  const reviews = [
    { business: proLead.id, author_name: 'Thandi M.', author_email: 'thandi@example.com', rating: 5, comment: 'Beautiful lodge and incredibly friendly staff. The safari trip was the highlight of our holiday!', status: 'approved' },
    { business: proLead.id, author_name: 'James O.', author_email: 'james@example.com', rating: 4, comment: 'Great value and clean rooms. Breakfast was excellent. Will stay again.', status: 'approved' },
    { business: proBiz.id, author_name: 'Sipho D.', author_email: 'sipho@example.com', rating: 5, comment: 'Honest workshop — they fixed my bakkie quickly and the price was fair. Highly recommend.', status: 'approved' },
    { business: proBiz.id, author_name: 'Lerato K.', author_email: 'lerato@example.com', rating: 5, comment: 'Professional team and they kept me updated throughout. The courtesy car was a lifesaver.', status: 'approved' },
    { business: proBiz.id, author_name: 'Pieter V.', author_email: 'pieter@example.com', rating: 4, comment: 'Good diagnostics and friendly service. Waiting area could use a coffee machine!', status: 'approved' },
    // one pending so admin moderation has something to action
    { business: proBiz.id, author_name: 'Anonymous', author_email: 'pending@example.com', rating: 3, comment: 'Service was okay, took a bit longer than expected.', status: 'pending' },
  ];
  for (const r of reviews) {
    await pb.collection('reviews').create(r);
  }
  console.log(`Created ${reviews.length} reviews (5 approved, 1 pending).`);

  // ---- events ----
  const [ev1, ev2, ev3, eg1, eg2, eg3] = await Promise.all([
    img('https://images.unsplash.com/photo-1540575467063-178a50c2df87?'),
    img('https://images.unsplash.com/photo-1556761175-b413da4baf72?'),
    img('https://images.unsplash.com/photo-1531058020387-3be344556be6?'),
    img('https://images.unsplash.com/photo-1559223607-a43c990c692c?'),
    img('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?'),
    img('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?'),
  ]);

  const events = [
    {
      title: 'Bushbuckridge Business Expo 2026', date: '2026-08-15 09:00:00', time: '09:00 – 16:00',
      venue: 'Bushbuckridge Civic Centre', cost: 'Free Entry', contact_info: 'expo@dbib.co.za', is_featured: true,
      description: '<p>The biggest local business networking event of the year. Meet suppliers, funders and customers, attend free workshops and showcase your enterprise.</p>',
      image: ev1, gallery: [eg1, eg2, eg3],
    },
    {
      title: 'Youth Skills & Employment Workshop', date: '2026-07-20 10:00:00', time: '10:00 – 14:00',
      venue: 'Acornhoek Community Hall', cost: 'Free Entry', contact_info: '013 799 5000',
      description: '<p>A practical workshop helping young people build CVs, prepare for interviews and learn about local job and training opportunities.</p>',
      image: ev2, gallery: [eg2, eg3],
    },
    {
      title: 'Community Farmers Market Day', date: '2026-07-05 08:00:00', time: '08:00 – 13:00',
      venue: 'Thulamahashe Sports Grounds', cost: 'R20 stall fee', contact_info: 'market@dbib.co.za',
      description: '<p>Buy fresh local produce, crafts and home-made food. Stalls available for local growers and crafters.</p>',
      image: ev3, gallery: [eg1, eg3],
    },
  ];
  for (const e of events) {
    const fd = new FormData();
    fd.append('title', e.title);
    fd.append('slug', slugify(e.title));
    fd.append('date', e.date);
    fd.append('time', e.time);
    fd.append('venue', e.venue);
    fd.append('cost', e.cost);
    fd.append('contact_info', e.contact_info);
    fd.append('description', e.description);
    fd.append('is_featured', e.is_featured ? 'true' : 'false');
    fd.append('image', blob(e.image), 'main.jpg');
    e.gallery.forEach((g, i) => fd.append('gallery', blob(g), `g${i}.jpg`));
    const created = await pb.collection('events').create(fd);
    console.log('Created event:', created.title);
  }

  console.log('\n=== SEED COMPLETE ===');
  console.log('Portal login: demo.owner@dbib.co.za / DemoOwner12345 (owns Acornhoek Auto Care)');
}
main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
