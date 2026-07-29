const fs = require('fs');
const path = require('path');

const DUMP = path.join(__dirname, 'bushnxfzxw_wp2114.sql');
const OUT = path.join(__dirname, 'relations.json');

const sql = fs.readFileSync(DUMP, 'utf8');

function insertBlock(table) {
  const re = new RegExp('INSERT INTO `' + table + '` \\([^)]*\\) VALUES\\s*([\\s\\S]*?);\\s*\\n');
  const m = sql.match(re);
  return m ? m[1] : '';
}

// wp_terms: (term_id, 'name', 'slug', term_group)
// Note: matchAll() yields full match objects, where index 0 is the whole
// matched string — destructuring must skip it (leading comma) to line up
// with the actual capture groups.
const terms = {};
for (const [, id, name, slug] of insertBlock('wp_terms').matchAll(/\((\d+), '([^']*)', '([^']*)', \d+\)/g)) {
  terms[id] = { name, slug };
}

// wp_term_taxonomy: (term_taxonomy_id, term_id, 'taxonomy', 'description', parent, count)
const taxonomyIdToTerm = {};
const categories = [];
for (const [, ttId, termId, taxonomy] of insertBlock('wp_term_taxonomy').matchAll(/\((\d+), (\d+), '([^']*)', '[^']*', \d+, \d+\)/g)) {
  if (taxonomy !== 'category') continue;
  const term = terms[termId];
  if (!term) continue;
  taxonomyIdToTerm[ttId] = term;
  categories.push({ wp_term_id: Number(termId), name: term.name, slug: term.slug });
}

// wp_term_relationships: (object_id, term_taxonomy_id, term_order)
const relationships = [];
for (const [, objectId, ttId] of insertBlock('wp_term_relationships').matchAll(/\((\d+), (\d+), \d+\)/g)) {
  const term = taxonomyIdToTerm[ttId];
  if (!term) continue;
  relationships.push({ wp_post_id: Number(objectId), category_slug: term.slug });
}

// wp_users: (ID, 'login', 'pass', 'nicename', 'email', 'url', 'registered', 'activation', status, 'display_name')
const users = {};
for (const m of insertBlock('wp_users').matchAll(/\((\d+), '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', \d+, '([^']*)'\)/g)) {
  users[m[1]] = m[2];
}

// post_author is field 2 of wp_posts: (ID, post_author, 'post_date', ...)
const postAuthors = {};
for (const m of sql.matchAll(/\((\d+), (\d+), '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', '\d{4}-\d{2}-\d{2}/g)) {
  postAuthors[m[1]] = users[m[2]] || null;
}

fs.writeFileSync(OUT, JSON.stringify({ categories, relationships, postAuthors }, null, 2));
console.log(`categories: ${categories.length}`);
console.log(`relationships: ${relationships.length}`);
console.log(`posts with an author: ${Object.values(postAuthors).filter(Boolean).length}`);