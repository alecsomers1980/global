// scripts/seed.mjs — run once against a fresh Supabase project: `node scripts/seed.mjs`
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey);

const rooms = [
  {
    slug: "deluxe-suite-room",
    name: "Deluxe Suite Room",
    description:
      "Our luxurious and spacious room can accommodate a maximum of 2 people, with a double bed and en-suite bathroom.",
    bed_type: "Double bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    published: true,
    sort_order: 1,
  },
  {
    slug: "king-deluxe-room",
    name: "King Deluxe Room",
    description:
      "Our luxurious and spacious Deluxe suite is fit for a king, with a king-sized bed and an additional single bed. The largest room at Woodpecker.",
    bed_type: "King bed + single bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 3,
    published: true,
    sort_order: 2,
  },
  {
    slug: "budget-room",
    name: "Budget Room",
    description:
      "Our budget room has a double bed and an en-suite, fully equipped with a fan, TV and DStv — perfect for an overnighter.",
    bed_type: "Double bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["Fan", "TV", "DStv"],
    published: true,
    sort_order: 3,
  },
  // Real copy/rates for these 5 pending the client's WP export — deliberately
  // unpublished stubs, not fabricated content.
  { slug: "double-room-1", name: "Double Room 1", published: false, sort_order: 4 },
  { slug: "double-room-2", name: "Double Room 2", published: false, sort_order: 5 },
  { slug: "double-room-3", name: "Double Room 3", published: false, sort_order: 6 },
  { slug: "family-room-1", name: "Family Room 1", published: false, sort_order: 7 },
  { slug: "family-room-2", name: "Family Room 2", published: false, sort_order: 8 },
];

const galleryCategories = [
  { name: "Rooms", sort_order: 1 },
  { name: "Grounds", sort_order: 2 },
  { name: "Restaurant", sort_order: 3 },
  { name: "Conferencing", sort_order: 4 },
];

const { error: roomsError } = await supabase.from("rooms").upsert(rooms, { onConflict: "slug" });
if (roomsError) throw roomsError;
console.log(`Seeded ${rooms.length} rooms.`);

const { error: catError } = await supabase
  .from("gallery_categories")
  .upsert(galleryCategories, { onConflict: "name" });
if (catError) throw catError;
console.log(`Seeded ${galleryCategories.length} gallery categories.`);