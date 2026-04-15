-- =====================================================
-- RIVERVIEW PREP: 2026 SCHOOL CALENDAR ENTRIES
-- Run this in your Supabase SQL Editor to populate
-- the calendar with all term dates & public holidays.
-- =====================================================

-- Remove any existing 2026 entries first (safe to re-run)
DELETE FROM calendar_entries WHERE date >= '2026-01-01' AND date <= '2026-12-31';

INSERT INTO calendar_entries (date, title, location, type, description) VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- TERM 1  (January – March)
-- ─────────────────────────────────────────────────────────────────────────────
('2026-01-01',  'New Year''s Day',                      'Campus',   'Holiday',  'Public Holiday'),
('2026-01-19',  'Staff Development Day',                'Campus',   'Academic', 'Staff report. Pupils not yet in attendance.'),
('2026-01-21',  'School Opens for Pupils – Term 1',    'Campus',   'Academic', 'First day of school for all learners.'),
('2026-03-21',  'Human Rights Day',                    'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-03-27',  'School Closes – Term 1 End',          'Campus',   'Academic', 'Last day of the first academic term.'),

-- ─────────────────────────────────────────────────────────────────────────────
-- TERM 2  (April – June)
-- ─────────────────────────────────────────────────────────────────────────────
('2026-04-03',  'Good Friday',                         'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-04-06',  'Family Day',                          'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-04-06',  'Staff Development Day',               'Campus',   'Academic', 'Staff report. Pupils not yet in attendance.'),
('2026-04-08',  'School Opens for Pupils – Term 2',   'Campus',   'Academic', 'First day of the second academic term.'),
('2026-04-27',  'Freedom Day',                         'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-05-01',  'Workers'' Day',                        'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-06-16',  'Youth Day',                           'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-06-26',  'School Closes – Term 2 End',          'Campus',   'Academic', 'Last day of the second academic term.'),

-- ─────────────────────────────────────────────────────────────────────────────
-- TERM 3  (July – September)
-- ─────────────────────────────────────────────────────────────────────────────
('2026-07-13',  'Staff Development Day',               'Campus',   'Academic', 'Staff report. Pupils not yet in attendance.'),
('2026-07-14',  'School Opens for Pupils – Term 3',   'Campus',   'Academic', 'First day of the third academic term.'),
('2026-08-10',  'National Women''s Day',               'Campus',   'Holiday',  'Public Holiday – school closed. (9 Aug falls on Sunday)'),
('2026-09-18',  'School Closes – Term 3 End',          'Campus',   'Academic', 'Last day of the third academic term.'),
('2026-09-24',  'Heritage Day',                        'Campus',   'Holiday',  'Public Holiday – school closed.'),

-- ─────────────────────────────────────────────────────────────────────────────
-- TERM 4  (October – November)
-- ─────────────────────────────────────────────────────────────────────────────
('2026-10-05',  'Staff Development Day',               'Campus',   'Academic', 'Staff report. Pupils not yet in attendance.'),
('2026-10-07',  'School Opens for Pupils – Term 4',   'Campus',   'Academic', 'First day of the fourth and final academic term.'),
('2026-11-26',  'School Closes – Term 4 End',          'Campus',   'Academic', 'Last day of school for the 2026 academic year.'),

-- ─────────────────────────────────────────────────────────────────────────────
-- YEAR-END PUBLIC HOLIDAYS
-- ─────────────────────────────────────────────────────────────────────────────
('2026-12-16',  'Day of Reconciliation',               'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-12-25',  'Christmas Day',                       'Campus',   'Holiday',  'Public Holiday – school closed.'),
('2026-12-26',  'Day of Goodwill',                     'Campus',   'Holiday',  'Public Holiday – school closed.');
