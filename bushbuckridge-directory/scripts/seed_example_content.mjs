import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import https from 'https';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve, reject);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

  const businesses = await pb.collection('businesses').getFullList();
  const byName = (name) => businesses.find((b) => b.name === name);

  // ---- JOBS ----
  const jobImages = {
    warehouse: await downloadImage('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80'),
    hospitality: await downloadImage('https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=80'),
    mechanic: await downloadImage('https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1200&q=80'),
    construction: await downloadImage('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80'),
    sales: await downloadImage('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80'),
    admin: await downloadImage('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&q=80'),
  }

  const jobs = [
    {
      title: 'Warehouse Assistant',
      company: byName('Bushbuckridge Hardware')?.name || 'Bushbuckridge Hardware',
      location: 'Bushbuckridge Town',
      type: 'Full-time',
      salary: 'R5 500 - R6 500',
      salary_period: 'Monthly',
      experience_level: 'Entry-level',
      positions: 2,
      closing_date: daysFromNow(30),
      responsibilities: p('Receive and check stock deliveries.', 'Pack and organise shelves.', 'Assist customers in the yard.'),
      requirements: p('Grade 12 or equivalent.', 'Able to lift and carry stock.', 'Reliable and punctual.'),
      how_to_apply: p('Email your CV using the contact details below, or visit the store in person.'),
      contact_name: 'Store Manager',
      contact_number: '013 123 4567',
      contact_email: 'jobs@bushbuckridgehardware.co.za',
      _img: jobImages.warehouse,
    },
    {
      title: 'Front of House / Guest Liaison',
      company: byName('Kruger Gateway Lodge')?.name || 'Kruger Gateway Lodge',
      location: 'Bushbuckridge Town',
      type: 'Full-time',
      salary: 'Market related + tips',
      salary_period: 'Monthly',
      experience_level: 'Mid-level',
      positions: 1,
      closing_date: daysFromNow(21),
      responsibilities: p('Welcome guests on arrival and manage check-in/out.', 'Coordinate with housekeeping and kitchen staff.', 'Handle guest queries and bookings.'),
      requirements: p('Previous hospitality experience preferred.', 'Excellent communication in English and local languages.', 'Friendly, presentable, and guest-focused.'),
      how_to_apply: p('Send your CV and a short cover note to the email below.'),
      contact_name: 'Lodge Manager',
      contact_number: '013 555 7788',
      contact_email: 'careers@krugergatewaylodge.co.za',
      _img: jobImages.hospitality,
    },
    {
      title: 'Junior Vehicle Mechanic',
      company: byName('Acornhoek Auto Care')?.name || 'Acornhoek Auto Care',
      location: 'Acornhoek',
      type: 'Full-time',
      salary: 'R7 000 - R9 000',
      salary_period: 'Monthly',
      experience_level: 'Entry-level',
      positions: 1,
      closing_date: daysFromNow(45),
      responsibilities: p('Assist senior mechanics with diagnostics and repairs.', 'Perform routine services (oil changes, brakes, tyres).', 'Keep the workshop clean and organised.'),
      requirements: p('N2/N3 in Motor Mechanics or equivalent experience.', "Valid driver's licence an advantage.", 'Willingness to learn and work in a team.'),
      how_to_apply: p('Apply via email with your CV, or drop it off at the workshop.'),
      contact_name: 'Workshop Foreman',
      contact_number: '013 764 2233',
      contact_email: 'careers@acornhoekautocare.co.za',
      _img: jobImages.mechanic,
    },
    {
      title: 'General Construction Worker',
      company: 'Bushveld Civils & Construction',
      location: 'Thulamahashe',
      type: 'Contract',
      salary: 'R350 / day',
      salary_period: 'Negotiable',
      experience_level: 'Entry-level',
      positions: 5,
      closing_date: daysFromNow(14),
      responsibilities: p('General labour on a local road maintenance project.', 'Mixing materials and assisting skilled tradesmen.', 'Following all on-site safety procedures.'),
      requirements: p('Physically fit and able to work outdoors.', 'Local resident preferred.', 'Previous construction experience an advantage.'),
      how_to_apply: p('Apply in person at the site office, Monday to Friday, 8am-3pm.'),
      contact_name: 'Site Supervisor',
      contact_number: '013 781 0099',
      contact_email: 'hr@bushveldcivils.co.za',
      _img: jobImages.construction,
    },
    {
      title: 'Retail Sales Assistant (Part-time)',
      company: byName('Bushbuckridge Hardware')?.name || 'Bushbuckridge Hardware',
      location: 'Bushbuckridge Town',
      type: 'Part-time',
      salary: 'R3 000',
      salary_period: 'Monthly',
      experience_level: 'Entry-level',
      positions: 1,
      closing_date: daysFromNow(20),
      responsibilities: p('Assist walk-in customers and process sales.', 'Keep the shop floor neat and well stocked.'),
      requirements: p('Grade 12.', 'Friendly and customer-focused.', 'Available weekends.'),
      how_to_apply: p('Email a short CV to the address below.'),
      contact_name: 'Store Manager',
      contact_number: '013 123 4567',
      contact_email: 'jobs@bushbuckridgehardware.co.za',
      _img: jobImages.sales,
    },
    {
      title: 'Admin Clerk (Internship)',
      company: 'Bushbuckridge Local Municipality',
      location: 'Bushbuckridge Town',
      type: 'Internship',
      salary: 'R4 200 stipend',
      salary_period: 'Monthly',
      experience_level: 'Entry-level',
      positions: 3,
      closing_date: daysFromNow(10),
      responsibilities: p('Filing, data capturing and general office support.', 'Assisting with correspondence and reception duties.'),
      requirements: p('National Diploma in Office/Public Administration (or studying towards).', 'Computer literate (MS Office).', 'Under 35 years old, as per municipal internship guidelines.'),
      how_to_apply: p('Submit a CV, ID copy and qualifications to the HR office or via email.'),
      contact_name: 'HR Department',
      contact_number: '013 799 5000',
      contact_email: 'internships@bushbuckridge.gov.za',
      _img: jobImages.admin,
    },
  ]

  console.log('Seeding jobs...')
  for (const job of jobs) {
    const { _img, ...data } = job
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)))
    fd.set('slug', `${slugify(job.title)}-${Math.random().toString(36).slice(2, 7)}`)
    if (_img) fd.append('image', new Blob([_img], { type: 'image/jpeg' }), 'job-cover.jpg')
    const created = await pb.collection('jobs').create(fd)
    console.log('  +', created.title)
  }

  // ---- OPPORTUNITIES ----
  const oppImages = {
    funding: await downloadImage('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80'),
    tender: await downloadImage('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80'),
    training: await downloadImage('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80'),
    grant: await downloadImage('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80'),
    mentorship: await downloadImage('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80'),
  }

  const opportunities = [
    {
      title: 'SEDA Small Business Funding Window',
      category: 'Funding',
      organization: 'Small Enterprise Development Agency (SEDA)',
      value: 'Up to R50,000 grant funding',
      deadline: daysFromNow(40),
      location: 'Mpumalanga Province',
      description: p('SEDA is opening a new funding window for small and micro businesses operating in Bushbuckridge and surrounding areas. Funding can be used for equipment, stock, and business growth.'),
      eligibility: p('Registered South African business (sole proprietor or CC/Pty).', 'Operating for at least 6 months.', 'Based in Mpumalanga.'),
      how_to_apply: p('Complete the online application form and submit supporting financial documents.'),
      required_documents: p('Certified ID copy', 'Proof of business registration', 'Latest 3 months bank statements'),
      reference_number: 'SEDA-MP-2026-014',
      contact_info: p('SEDA Bushbuckridge Office, 013 799 1234, mpumalanga@seda.org.za'),
      link: 'https://www.seda.org.za',
      _img: oppImages.funding,
    },
    {
      title: 'Municipal Tender: Road Maintenance & Repairs',
      category: 'Tenders',
      organization: 'Bushbuckridge Local Municipality',
      value: 'Estimated R2.5 million',
      deadline: daysFromNow(25),
      location: 'Bushbuckridge Town & surrounding wards',
      description: p('The municipality invites suitably qualified and experienced contractors to submit bids for the maintenance and pothole repair of identified roads across the region.'),
      eligibility: p('Valid CIDB grading (minimum 4CE or higher).', 'Tax compliance status required.', 'Proven road maintenance track record.'),
      how_to_apply: p('Tender documents are available from the Municipal Supply Chain Management office on payment of a non-refundable deposit.'),
      required_documents: p('CIDB registration certificate', 'Tax clearance / SARS PIN', 'Company registration documents'),
      reference_number: 'BLM/ROADS/2026/07',
      contact_info: p('Supply Chain Management, 013 799 5000, scm@bushbuckridge.gov.za'),
      link: '',
      _img: oppImages.tender,
    },
    {
      title: 'Free Digital Skills Training Programme',
      category: 'Training',
      organization: 'Mpumalanga Department of Economic Development',
      value: 'Free — fully sponsored',
      deadline: daysFromNow(15),
      location: 'Bushbuckridge Skills Centre, Thulamahashe',
      description: p('A free 4-week digital skills programme covering computer literacy, basic bookkeeping software, and online marketing for small business owners and job seekers.'),
      eligibility: p('Bushbuckridge residents aged 18-35.', 'Basic literacy in English.', 'Commitment to attend all sessions.'),
      how_to_apply: p('Register in person at the Skills Centre or via the WhatsApp number below.'),
      required_documents: p('Copy of ID', 'Proof of residence'),
      reference_number: '',
      contact_info: p('Skills Centre Coordinator, WhatsApp 082 555 1212'),
      link: '',
      _img: oppImages.training,
    },
    {
      title: 'NYDA Youth Business Grant',
      category: 'Grants',
      organization: 'National Youth Development Agency (NYDA)',
      value: 'Up to R200,000',
      deadline: daysFromNow(60),
      location: 'National (Mpumalanga applicants encouraged)',
      description: p('The NYDA Grant Programme supports youth-owned businesses with start-up or growth capital, paired with mandatory business mentorship.'),
      eligibility: p('South African citizen aged 18-35.', 'Majority youth-owned business (51% or more).', 'A viable business plan.'),
      how_to_apply: p('Apply online via the NYDA portal and attend a screening interview.'),
      required_documents: p('Business plan', 'Certified ID copy', 'Proof of business registration (if applicable)'),
      reference_number: 'NYDA-GRANT-2026',
      contact_info: p('NYDA Call Centre, 0800 728 728'),
      link: 'https://www.nyda.gov.za',
      _img: oppImages.grant,
    },
    {
      title: 'Local Business Mentorship Programme',
      category: 'Business Support',
      organization: 'Doing Business in Bushbuckridge',
      value: 'Free — 6-month programme',
      deadline: daysFromNow(35),
      location: 'Bushbuckridge (online + in-person sessions)',
      description: p('A free mentorship programme pairing established local business owners with newer entrepreneurs for guidance on operations, marketing, and financial management.'),
      eligibility: p('Business listed on the Bushbuckridge Community Directory.', 'Operating for less than 3 years.', 'Willing to commit to monthly check-ins.'),
      how_to_apply: p('Submit your interest via the Enquiries page on the directory.'),
      required_documents: p('None required to apply'),
      reference_number: '',
      contact_info: p('Doing Business in Bushbuckridge, info@dbib.co.za'),
      link: '',
      _img: oppImages.mentorship,
    },
  ]

  console.log('Seeding opportunities...')
  for (const opp of opportunities) {
    const { _img, ...data } = opp
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)))
    if (_img) fd.append('image', new Blob([_img], { type: 'image/jpeg' }), 'opportunity-cover.jpg')
    const created = await pb.collection('opportunities').create(fd)
    console.log('  +', created.title)
  }

  // ---- SPOTLIGHT ARTICLE (Pro Business tier only) ----
  const proBusiness = byName('Acornhoek Auto Care')
  if (proBusiness) {
    console.log('Seeding spotlight article...')
    const spotlightImg = await downloadImage('https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1600&q=80')
    const fd = new FormData()
    fd.append('business_id', proBusiness.id)
    fd.append('status', 'published')
    fd.append('layout', 'default')
    fd.append('title', `How ${proBusiness.name} Became Acornhoek's Trusted Name in Auto Repairs`)
    fd.append('quarter', currentQuarter())
    fd.append('year', String(new Date().getFullYear()))
    fd.append('content', p(
      `When ${proBusiness.name} opened its doors, the goal was simple: honest, reliable vehicle repairs for the Acornhoek community at a fair price.`,
      'Today, the workshop handles everything from routine services to full diagnostics, and has built a loyal customer base through word of mouth alone.',
      '"We treat every car like it\'s our own," says the workshop foreman. "If a customer doesn\'t need a part replaced, we tell them. That honesty is why people keep coming back."',
      'The team has also taken on apprentices from the local technical college, helping grow skills in the area while keeping the workshop staffed with motivated young mechanics.',
      'Looking ahead, the business plans to expand its service bays and add a dedicated tyre-fitting centre — all while staying true to the values that built its reputation.'
    ))
    fd.append('images', new Blob([spotlightImg], { type: 'image/jpeg' }), 'spotlight-hero.jpg')
    const created = await pb.collection('spotlight_articles').create(fd)
    console.log('  + Spotlight article:', created.id)
  }

  // ---- EDITOR SPOTLIGHT (homepage feature) ----
  console.log('Seeding editor spotlight...')
  const editorImg = await downloadImage('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80')
  const fdEditor = new FormData()
  fdEditor.append('name', 'Thandi Mahlangu')
  fdEditor.append('title', 'Founder, Acornhoek Auto Care')
  fdEditor.append('short_description', "I started with one bay and a toolbox. Today we employ five people from right here in Acornhoek — that's what keeps me going.")
  fdEditor.append('full_description', p(
    'Thandi Mahlangu grew up in Acornhoek and always had a passion for cars, learning the trade from her uncle\'s small roadside workshop as a teenager.',
    'After years of working for other garages, she took the leap in 2019 and opened Acornhoek Auto Care with a single service bay and a small loan from family.',
    'Seven years on, the workshop has grown into one of the most trusted names in the area, known for honest pricing and quality work — and for training the next generation of local mechanics.',
    '"This community supported me from day one," Thandi says. "Every job we do is a way of giving back to that."'
  ))
  fdEditor.append('is_active', 'true')
  fdEditor.append('layout', 'default')
  fdEditor.append('image', new Blob([editorImg], { type: 'image/jpeg' }), 'editor-spotlight.jpg')
  const createdEditor = await pb.collection('editor_spotlight').create(fdEditor)
  console.log('  + Editor spotlight:', createdEditor.id)

  console.log('\nDone seeding example content.')
}

function p(...paragraphs) {
  return paragraphs.map((t) => `<p>${t}</p>`).join('')
}

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function currentQuarter() {
  const m = new Date().getMonth()
  return `Q${Math.floor(m / 3) + 1}`
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

main().catch((e) => {
  console.error('ERR', e.message, JSON.stringify(e.data || e.response?.data || {}))
})
