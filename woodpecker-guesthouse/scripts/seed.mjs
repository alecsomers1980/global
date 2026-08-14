// scripts/seed.mjs — run once against a fresh Supabase project: `node scripts/seed.mjs`
//
// Room copy, bed/guest details and hero/gallery photos below are all real —
// recovered from the client's WordPress database export and uploads folder
// (2026-08-14), not estimated or invented. Photos already live in the
// `site-media` Storage bucket (uploaded via a one-off migration script, not
// checked into this repo) — this script only writes the `rooms` rows that
// point at them.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey);

const BUCKET_PATH = (slug, file) =>
  `${url}/storage/v1/object/public/site-media/rooms/${slug}/${file}.webp`;

const rooms = [
  {
    slug: "deluxe-suite-room",
    name: "Deluxe Suite Room",
    description:
      "Our luxurious and spacious room can accommodate a maximum of 2 people, with a double bed and en-suite bathroom. To make our guests feel even more at home, the room overlooks the garden and is equipped with a bar fridge, kettle, air-con, couch, and a flat-screen TV with DStv.",
    bed_type: "Double bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["Bar fridge", "Kettle", "Air-con", "Flat-screen TV", "DStv", "Garden view", "Couch"],
    hero_image: BUCKET_PATH("deluxe-suite-room", "IMG_4677"),
    gallery_images: ["4677", "4681", "4697", "4680", "4699", "4690", "4687", "4688"].map((n) =>
      BUCKET_PATH("deluxe-suite-room", `IMG_${n}`)
    ),
    published: true,
    sort_order: 1,
  },
  {
    slug: "king-deluxe-room",
    name: "King Deluxe Room",
    description:
      "Our luxurious and spacious Deluxe suite is fit for a king, with a king-sized bed and an additional single bed. Boasting the largest room in the guesthouse, this suite is equipped with a luxurious en-suite bathroom and jacuzzi.",
    bed_type: "King bed + single bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 3,
    amenities: ["En-suite bathroom", "Jacuzzi"],
    hero_image: BUCKET_PATH("king-deluxe-room", "IMG_4802"),
    gallery_images: ["4802", "4797", "4799", "4829", "4798", "4807", "4804", "4795"].map((n) =>
      BUCKET_PATH("king-deluxe-room", `IMG_${n}`)
    ),
    published: true,
    sort_order: 2,
  },
  {
    slug: "budget-room",
    name: "Budget Room",
    description:
      "Our budget room has a double bed and an en-suite, fully equipped with a fan, TV and DStv — perfect for an overnighter while travelling.",
    bed_type: "Double bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["Fan", "TV", "DStv"],
    hero_image: BUCKET_PATH("budget-room", "IMG_4907"),
    gallery_images: ["4907", "4910", "4914", "4915", "4917", "4918", "4920"].map((n) =>
      BUCKET_PATH("budget-room", `IMG_${n}`)
    ),
    published: true,
    sort_order: 3,
  },
  {
    slug: "double-room-1",
    name: "Double Room 1",
    description:
      "Our first double room option includes two single beds and an en-suite bathroom, fully equipped with a TV, DStv, air-con and a beautiful veranda to enjoy the outdoor scenery.",
    bed_type: "Two single beds",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["TV", "DStv", "Air-con", "Veranda"],
    hero_image: BUCKET_PATH("double-room-1", "IMG_4725"),
    gallery_images: ["4725", "4726", "4736", "4729", "4731", "4737", "4738", "4739"].map((n) =>
      BUCKET_PATH("double-room-1", `IMG_${n}`)
    ),
    published: true,
    sort_order: 4,
  },
  {
    slug: "double-room-2",
    name: "Double Room 2",
    description:
      "Our second double room option includes a queen-sized bed, en-suite bathroom and sleeps two guests. Fully equipped with a flat-screen TV, DStv and a stunning balcony overlooking our guesthouse garden.",
    bed_type: "Queen bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["Flat-screen TV", "DStv", "Balcony", "Garden view"],
    hero_image: BUCKET_PATH("double-room-2", "IMG_4823"),
    gallery_images: ["4823", "4824", "4826", "4829-1", "4831", "4836"].map((n) =>
      BUCKET_PATH("double-room-2", `IMG_${n}`)
    ),
    published: true,
    sort_order: 5,
  },
  {
    slug: "double-room-3",
    name: "Double Room 3",
    description:
      "Our third double room option includes a king-sized bed and en-suite bathroom. Fully equipped with a bar fridge, air-con, flat-screen TV, DStv and a mini-balcony to enjoy breakfast outdoors.",
    bed_type: "King bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["Bar fridge", "Air-con", "Flat-screen TV", "DStv", "Balcony"],
    hero_image: BUCKET_PATH("double-room-3", "IMG_4863"),
    gallery_images: ["4863", "4865", "4867", "4868", "4870", "4871", "4872"].map((n) =>
      BUCKET_PATH("double-room-3", `IMG_${n}`)
    ),
    published: true,
    sort_order: 6,
  },
  {
    slug: "family-room-1",
    name: "Family Room 1",
    description:
      "Our luxurious and spacious family room can accommodate a maximum of 4 guests, with a king-sized bed in the first room and two single beds in the other. Both rooms are joined by an interlinking shared bathroom and are equipped with a flat-screen TV, DStv and air-con.",
    bed_type: "King bed + 2 single beds (interlinking)",
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    amenities: ["Flat-screen TV", "DStv", "Air-con", "Interlinking rooms"],
    hero_image: BUCKET_PATH("family-room-1", "IMG_4711"),
    gallery_images: ["4711", "4719", "4718", "4717", "4720", "4715", "4751", "4755"].map((n) =>
      BUCKET_PATH("family-room-1", `IMG_${n}`)
    ),
    published: true,
    sort_order: 7,
  },
  {
    // Real site content: Family Room 1 and 2 share identical copy and photos
    // (twin rooms) — not a scraping error, verified directly against the DB.
    slug: "family-room-2",
    name: "Family Room 2",
    description:
      "Our luxurious and spacious family room can accommodate a maximum of 4 guests, with a king-sized bed in the first room and two single beds in the other. Both rooms are joined by an interlinking shared bathroom and are equipped with a flat-screen TV, DStv and air-con.",
    bed_type: "King bed + 2 single beds (interlinking)",
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    amenities: ["Flat-screen TV", "DStv", "Air-con", "Interlinking rooms"],
    hero_image: BUCKET_PATH("family-room-2", "IMG_4711"),
    gallery_images: ["4711", "4719", "4718", "4717", "4720", "4715", "4751", "4755"].map((n) =>
      BUCKET_PATH("family-room-2", `IMG_${n}`)
    ),
    published: true,
    sort_order: 8,
  },
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
