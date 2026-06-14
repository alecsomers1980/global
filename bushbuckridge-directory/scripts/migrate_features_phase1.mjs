import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const BUSINESSES_ID = 'pbc_3548013948';

const IMG_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const FILE_MAX = 5242880; // 5MB

function fileField(name, maxSelect) {
  return { name, type: 'file', maxSelect, maxSize: FILE_MAX, mimeTypes: IMG_MIMES, thumbs: [], protected: false };
}
function jsonField(name) {
  return { name, type: 'json', maxSize: 2000000 };
}

async function addFields(collName, newFields) {
  const c = await pb.collections.getOne(collName);
  const existing = new Set((c.fields || []).map((f) => f.name));
  const toAdd = newFields.filter((f) => !existing.has(f.name));
  if (toAdd.length === 0) {
    console.log(`${collName}: nothing to add (all ${newFields.length} fields exist)`);
    return;
  }
  const merged = [...c.fields, ...toAdd];
  await pb.collections.update(c.id, { fields: merged });
  console.log(`${collName}: added ${toAdd.map((f) => f.name).join(', ')}`);
}

async function main() {
  await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

  // ---- businesses: new feature fields ----
  await addFields('businesses', [
    { name: 'address', type: 'text' },
    fileField('cover_image', 1),
    jsonField('business_hours'),
    jsonField('services'),
    { name: 'video_url', type: 'url' },
    jsonField('faqs'),
    jsonField('certifications'),
    { name: 'special_offer', type: 'text' },
    { name: 'special_offer_expires', type: 'date' },
    { name: 'map_lat', type: 'number' },
    { name: 'map_lng', type: 'number' },
    { name: 'years_in_business', type: 'number' },
    { name: 'team_size', type: 'text' },
  ]);

  // ---- jobs / events / opportunities: main photo + gallery ----
  for (const coll of ['jobs', 'events', 'opportunities']) {
    await addFields(coll, [fileField('image', 1), fileField('gallery', 10)]);
  }

  // ---- reviews collection ----
  let reviews = null;
  try {
    reviews = await pb.collections.getOne('reviews');
    console.log('reviews: already exists');
  } catch {}
  if (!reviews) {
    await pb.collections.create({
      name: 'reviews',
      type: 'base',
      fields: [
        { name: 'business', type: 'relation', collectionId: BUSINESSES_ID, maxSelect: 1, required: true, cascadeDelete: true },
        { name: 'author_name', type: 'text', required: true, max: 120 },
        { name: 'author_email', type: 'email', required: true },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5, onlyInt: true },
        { name: 'comment', type: 'text', required: true, max: 2000 },
        { name: 'status', type: 'select', values: ['pending', 'approved', 'rejected'], maxSelect: 1, required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      ],
      listRule: 'status = "approved" || @request.auth.is_admin = true',
      viewRule: 'status = "approved" || @request.auth.is_admin = true',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
    });
    console.log('reviews: created (create locked to is_admin / service account)');
  }

  console.log('\n=== DONE ===');
}
main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
