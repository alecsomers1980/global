// scripts/remove-heel-against-the-head-video.js
// One-off cleanup: delete the seeded YouTube video row for 'heel-against-the-head'.
// The video is genuine footage from the real 1999 film adaptation, but the uploader
// is a third-party channel, not an official source — likely an unauthorized upload
// of the client's own copyrighted work. South Canon is a rights-licensing agency,
// so this undercuts the product's positioning. The two photo rows on the same play
// are stock imagery and are NOT touched.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { Client } = require('pg')

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()

  try {
    await db.query('begin')

    const deleted = await db.query(
      `delete from play_media
       where type = 'video'
         and play_id = (select id from plays where slug = 'heel-against-the-head')
       returning id, type, url`,
    )
    console.log('deleted rows:', deleted.rows)
    if (deleted.rowCount !== 1) throw new Error(`expected exactly 1 row deleted, got ${deleted.rowCount}`)

    await db.query('commit')
    console.log('done')
  } catch (err) {
    await db.query('rollback')
    throw err
  } finally {
    await db.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
