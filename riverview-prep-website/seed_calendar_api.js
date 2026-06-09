const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ctfwxbrjyxjcdsrbdxxz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Znd4YnJqeXhqY2RzcmJkeHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAwNjk2NSwiZXhwIjoyMDkzNTgyOTY1fQ.4fL8QCtMUWElq0cgO6fkbNPwFmhzAndROuSFvAWTDYE'
);

const calendarEntries = [
  // ════════════════════ APRIL 2026 ════════════════════
  { date: '2026-04-03', title: 'Good Friday', location: null, type: 'Holiday', description: 'Public Holiday' },
  { date: '2026-04-05', title: 'Easter Sunday', location: null, type: 'Holiday', description: 'Public Holiday' },
  { date: '2026-04-06', title: 'Easter Monday / Family Day', location: null, type: 'Holiday', description: 'Public Holiday' },
  { date: '2026-04-07', title: 'Ehlanzeni Netball Trials', location: null, type: 'Sports', description: 'Regional netball trials' },
  { date: '2026-04-14', title: 'School Opens — Term 2', location: 'Campus', type: 'Academic', description: 'Term 2 begins at 07h00' },
  { date: '2026-04-14', title: 'Senior Primary Camp', location: 'Three Sisters, Lows Creek', type: 'Academic', description: 'Day 1 of Senior Primary outdoor camp' },
  { date: '2026-04-15', title: 'Senior Primary Camp', location: 'Three Sisters, Lows Creek', type: 'Academic', description: 'Day 2 of Senior Primary outdoor camp' },
  { date: '2026-04-16', title: 'Senior Primary Camp', location: 'Three Sisters, Lows Creek', type: 'Academic', description: 'Day 3 of Senior Primary outdoor camp' },
  { date: '2026-04-17', title: 'Senior Primary Camp Return', location: 'Campus', type: 'Academic', description: 'Pupils return from Three Sisters camp' },
  { date: '2026-04-17', title: 'Mini Netball u7-9 & Tag-Rugby u7-8 Festival', location: 'RPS', type: 'Sports', description: 'Home festival hosted at Riverview' },
  { date: '2026-04-17', title: 'Do More Foundation', location: null, type: 'Community', description: 'Do More Foundation initiative' },
  { date: '2026-04-20', title: 'Gr 4-7 Standardised Test: Natural Science', location: 'Campus', type: 'Academic', description: 'Standardised testing week begins' },
  { date: '2026-04-21', title: 'u9-Open Netball & Rugby', location: 'Penryn', type: 'Sports', description: 'Away fixture at Penryn' },
  { date: '2026-04-22', title: 'u7-8 Netball', location: 'Penryn', type: 'Sports', description: 'Away fixture at Penryn' },
  { date: '2026-04-22', title: 'u9-Open Rugby', location: 'Laerskool Malelane', type: 'Sports', description: 'Away fixture at Ls Malelane' },
  { date: '2026-04-22', title: 'u9-Open Netball', location: 'Laerskool Sabie', type: 'Sports', description: 'Away fixture at Ls Sabie' },
  { date: '2026-04-24', title: 'u9-Open Rugby', location: 'White River Primary', type: 'Sports', description: 'Away fixture at WRP' },
  { date: '2026-04-25', title: 'Netball Clinic', location: 'RPS', type: 'Sports', description: 'Coaching clinic hosted at Riverview' },
  { date: '2026-04-27', title: 'Freedom Day', location: null, type: 'Holiday', description: 'Public Holiday' },
  { date: '2026-04-28', title: 'Gr 4-7 Standardised Test: Social Science', location: 'Campus', type: 'Academic', description: 'Standardised testing' },
  { date: '2026-04-28', title: 'u9-Open Netball League', location: 'Laerskool Numbi', type: 'Sports', description: 'League fixture at Ls Numbi' },

  // ════════════════════ MAY 2026 ════════════════════
  { date: '2026-05-01', title: "Workers' Day", location: null, type: 'Holiday', description: 'Public Holiday' },
  { date: '2026-05-04', title: 'Gr 4-7 Standardised Test: English', location: 'Campus', type: 'Academic', description: 'Standardised testing' },
  { date: '2026-05-05', title: 'u11/13 Rugby', location: 'RPS', type: 'Sports', description: 'v Uplands @ RPS — home fixture' },
  { date: '2026-05-06', title: 'u9-Open Netball', location: 'Penryn', type: 'Sports', description: 'Away fixture @ Penryn' },
  { date: '2026-05-06', title: 'u9-Open Rugby', location: 'RPS', type: 'Sports', description: 'v Penryn @ RPS — home fixture' },
  { date: '2026-05-07', title: 'u9-Open Netball League', location: 'Clivia', type: 'Sports', description: 'League fixture at Clivia' },
  { date: '2026-05-08', title: "JP & Preschool Mother's Morning", location: 'Campus', type: 'Community', description: 'A special morning celebrating mothers' },
  { date: '2026-05-08', title: 'u7-8 Netball & Tag-Rugby', location: 'Uplands', type: 'Sports', description: 'Away fixture at Uplands' },
  { date: '2026-05-09', title: 'Do More Foundation', location: null, type: 'Community', description: 'Do More Foundation initiative' },
  { date: '2026-05-09', title: 'Selati Marathon', location: 'Malelane Rugby Club', type: 'Community', description: 'Community fun run/marathon event' },
  { date: '2026-05-11', title: 'Sport Co Meeting', location: 'Campus', type: 'Academic', description: 'Sports coordinators meeting' },
  { date: '2026-05-11', title: 'Gr 4-7 Standardised Test: Afrikaans', location: 'Campus', type: 'Academic', description: 'Standardised testing' },
  { date: '2026-05-13', title: 'u9-Open Netball League', location: 'Laerskool Malelane', type: 'Sports', description: 'League fixture at Ls Malelane' },
  { date: '2026-05-13', title: 'u9-Open Rugby', location: 'Curro Meridian', type: 'Sports', description: 'Away fixture at Curro Meridian' },
  { date: '2026-05-14', title: 'u9-Open Rugby', location: 'Komatipoort Akademie', type: 'Sports', description: 'Away fixture at Komatipoort Akademie' },
  { date: '2026-05-15', title: 'u7-8 Netball & Tag-Rugby', location: 'Curro Nelspruit', type: 'Sports', description: 'Away fixture at Curro Nelspruit' },
  { date: '2026-05-18', title: 'Gr 4-7 Standardised Test: Mathematics', location: 'Campus', type: 'Academic', description: 'Standardised testing' },
  { date: '2026-05-19', title: 'u9-Open Netball', location: 'Uplands', type: 'Sports', description: 'Away fixture at Uplands' },
  { date: '2026-05-20', title: 'Preschool Bee Fun Day', location: 'Campus', type: 'Community', description: 'Fun day for preschool learners' },
  { date: '2026-05-21', title: 'u9-Open Netball & u11-Open Soccer', location: 'RPS', type: 'Sports', description: 'v Skukuza — home fixture' },
  { date: '2026-05-22', title: 'Interhouse Netball & Rugby', location: 'Campus', type: 'Sports', description: 'Interhouse competition day' },
  { date: '2026-05-23', title: 'u7/8 Netball & Tag-Rugby', location: 'White River Primary', type: 'Sports', description: 'Away fixture at WRP' },
  { date: '2026-05-23', title: 'u13 Boys Rugby', location: 'Penryn', type: 'Sports', description: 'Away fixture at Penryn' },
  { date: '2026-05-25', title: 'Gr 4-7 Standardised Test: Natural Science', location: 'Campus', type: 'Academic', description: 'Standardised testing' },
  { date: '2026-05-25', title: 'JP Soccer & SP Hockey Changeover', location: 'Campus', type: 'Sports', description: 'Sport code changeover for new season' },
  { date: '2026-05-29', title: 'Slipper Day', location: 'Campus', type: 'Community', description: 'Casual fundraiser day' },

  // ════════════════════ JUNE 2026 ════════════════════
  { date: '2026-06-01', title: 'Gr 4-7 Standardised Test: Social Science', location: 'Campus', type: 'Academic', description: 'Standardised testing' },
  { date: '2026-06-02', title: 'Netball & Soccer Festival', location: 'RPS', type: 'Sports', description: 'Home festival hosted at Riverview' },
  { date: '2026-06-05', title: 'u7-9 Soccer Boys & Girls', location: 'Penryn', type: 'Sports', description: 'Away fixture at Penryn' },
  { date: '2026-06-08', title: 'Gr 4-7 Exam Week Begins', location: 'Campus', type: 'Academic', description: 'Mid-year examinations — Day 1' },
  { date: '2026-06-09', title: 'Gr 4-7 Exam Week', location: 'Campus', type: 'Academic', description: 'Mid-year examinations — Day 2' },
  { date: '2026-06-10', title: 'Gr 4-7 Exam Week', location: 'Campus', type: 'Academic', description: 'Mid-year examinations — Day 3' },
  { date: '2026-06-11', title: 'Gr 4-7 Exam Week', location: 'Campus', type: 'Academic', description: 'Mid-year examinations — Day 4' },
  { date: '2026-06-12', title: 'Gr 4-7 Exam Week', location: 'Campus', type: 'Academic', description: 'Mid-year examinations — Day 5' },
  { date: '2026-06-12', title: 'u7-9 Soccer Boys & Girls', location: 'Curro Meridian', type: 'Sports', description: 'Away fixture at Curro Meridian' },
  { date: '2026-06-16', title: 'Youth Day', location: null, type: 'Holiday', description: 'Public Holiday' },
  { date: '2026-06-19', title: "JP & Preschool Father's Morning", location: 'Campus', type: 'Community', description: 'A special morning celebrating fathers' },
  { date: '2026-06-19', title: 'u7-9 Soccer Boys & Girls', location: 'Curro Mbombela', type: 'Sports', description: 'Away fixture at Curro Mbombela' },
  { date: '2026-06-26', title: 'School Closes — End of Term 2', location: 'Campus', type: 'Academic', description: 'Term 2 ends at 10h00' },
];

async function seed() {
  console.log(`Seeding ${calendarEntries.length} calendar entries...`);

  // Delete existing April-June 2026 entries to avoid duplicates
  const { error: delErr } = await supabase
    .from('calendar_entries')
    .delete()
    .gte('date', '2026-04-01')
    .lte('date', '2026-06-30');

  if (delErr) {
    console.error('Error cleaning up:', delErr.message);
  } else {
    console.log('Cleaned up existing Apr-Jun 2026 entries');
  }

  // Insert in batches
  const batchSize = 20;
  let inserted = 0;
  for (let i = 0; i < calendarEntries.length; i += batchSize) {
    const batch = calendarEntries.slice(i, i + batchSize);
    const { error } = await supabase.from('calendar_entries').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${calendarEntries.length}`);
    }
  }

  // Verify
  const { data: all, error: vErr } = await supabase
    .from('calendar_entries')
    .select('date, title')
    .gte('date', '2026-04-01')
    .lte('date', '2026-06-30')
    .order('date', { ascending: true });

  console.log(`\n=== ${all?.length} CALENDAR ENTRIES (Apr-Jun 2026) ===`);
  all?.forEach(e => console.log(`  ${e.date} — ${e.title}`));
  console.log('\nDone!');
}

seed().catch(console.error);
