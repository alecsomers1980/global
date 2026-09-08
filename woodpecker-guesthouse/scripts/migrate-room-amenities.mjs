// One-off: canonicalizes "TV" -> "Flat-screen TV" in rooms.amenities so
// every existing value matches a label in src/lib/room-amenities.ts (only
// Budget Room has bare "TV" today — the other 7 rooms already say
// "Flat-screen TV"). Needed for the admin AmenitiesPicker checkboxes and
// the public icon-chip lookup (findAmenityByLabel) to recognize it.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(url, serviceKey);

const { data: rooms, error: selectError } = await supabase
  .from('rooms')
  .select('id, name, amenities');

if (selectError) throw selectError;

for (const room of rooms ?? []) {
  if (!Array.isArray(room.amenities) || !room.amenities.includes('TV')) continue;

  const deduped = [
    ...new Set(
      room.amenities.map((amenity) =>
        amenity === 'TV' ? 'Flat-screen TV' : amenity
      )
    ),
  ];

  const { error: updateError } = await supabase
    .from('rooms')
    .update({ amenities: deduped })
    .eq('id', room.id);

  if (updateError) throw updateError;

  console.log(
    `${room.name}: ${JSON.stringify(room.amenities)} -> ${JSON.stringify(deduped)}`
  );
}

console.log('Done.');
