insert into playwrights (name, slug, bio, country, status)
values (
  'Paul Slabolepszy',
  'paul-slabolepszy',
  'Paul Slabolepszy is one of South Africa''s most performed playwrights, with a body of work spanning four decades of South African life.',
  'South Africa',
  'published'
) on conflict (slug) do nothing;

insert into plays (title, slug, logline, synopsis_short, genres, year_written, duration_min, acts, languages, setting, time_period, status)
values (
  'Saturday Night at the Palace',
  'saturday-night-at-the-palace',
  'A late-night roadhouse encounter turns an ordinary evening into a reckoning.',
  'Two white men and a black roadhouse worker collide on a Saturday night, and the evening turns from banter to violence.',
  array['Drama'],
  1982,
  90,
  1,
  array['English'],
  'A roadhouse outside Johannesburg.',
  '1980s',
  'published'
) on conflict (slug) do nothing;

insert into play_playwrights (play_id, playwright_id, role, sort)
select p.id, w.id, 'author', 0
from plays p, playwrights w
where p.slug = 'saturday-night-at-the-palace' and w.slug = 'paul-slabolepszy'
on conflict do nothing;

insert into play_roles (play_id, name, gender, sort)
select p.id, r.name, r.gender::role_gender, r.sort
from plays p,
     (values ('Vince', 'male', 0), ('Forsie', 'male', 1), ('September', 'male', 2)) as r(name, gender, sort)
where p.slug = 'saturday-night-at-the-palace';

insert into rights_availability (play_id, territory, tier_id, status)
select p.id, t.territory, t.tier_id, 'available'::availability_status
from plays p,
     (values ('South Africa', 'amateur'), ('South Africa', 'professional'), ('South Africa', 'educational')) as t(territory, tier_id)
where p.slug = 'saturday-night-at-the-palace';
