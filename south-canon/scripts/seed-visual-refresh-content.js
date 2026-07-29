// scripts/seed-visual-refresh-content.js
// One-off seed script for the 2026-07-28 visual-refresh plan. Run once; re-running will fail
// cleanly on the `plays.slug` unique constraint rather than duplicating rows.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { Client } = require('pg')

const PEXELS = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const NEW_PLAYS = [
  {
    title: 'Over the Hill',
    slug: 'over-the-hill',
    logline: 'A rugby reunion drama that doubles as a reckoning with guilt, masculinity and the stories men tell themselves.',
    synopsis_short: "Old teammates gather for a rugby club reunion in this DALRO Award-winning drama, one of several Slabolepszy plays that use the game to probe masculinity and unresolved guilt.",
    genres: ['Drama', 'Comedy'],
    themes: ['Rugby', 'Masculinity', 'Reunion'],
    year_written: 1985,
    languages: ['English'],
    setting: 'A rugby club, South Africa',
    hero_image_url: PEXELS(6896181, 1600),
  },
  {
    title: 'Smallholding',
    slug: 'smallholding',
    logline: 'A darkly comic, absurdist turn from Slabolepszy, set on the kind of small farm that swallows the people trying to make it pay.',
    synopsis_short: "Winner of the Vita Best Play award, Smallholding is one of the plays scholars point to for Slabolepszy's absurdist streak and comic technique.",
    genres: ['Comedy'],
    themes: ['Absurdism', 'Rural life'],
    year_written: 1989,
    languages: ['English'],
    setting: 'A smallholding, South Africa',
    hero_image_url: PEXELS(6896179, 1600),
  },
  {
    title: 'Mooi Street Moves',
    slug: 'mooi-street-moves',
    logline: "Two men scraping by on Johannesburg's Mooi Street, an odd-couple friendship tested by the politics and social fractures of the city around them.",
    synopsis_short: 'Written for Seputla Sebogodi and Martin Le Maitre and later staged internationally (Glasgow MayFest, Amstel Playwright of the Year), Mooi Street Moves pairs buddy-comedy instincts with a hard look at social and political fracture.',
    genres: ['Comedy', 'Drama'],
    themes: ['Friendship', 'Social change'],
    year_written: 1992,
    languages: ['English'],
    setting: 'Mooi Street, Johannesburg',
    hero_image_url: PEXELS(12092991, 1600),
  },
  {
    title: 'The Return of Elvis du Pisanie',
    slug: 'the-return-of-elvis-du-pisanie',
    logline: "One of Slabolepszy's most garlanded plays, originally performed as a solo tour-de-force by the writer himself.",
    synopsis_short: 'The Return of Elvis du Pisanie swept the Vita, Fleur du Cap and DALRO Best Play awards in the same year — the role of Eddie made Slabolepszy the first South African actor to win every major Best Actor award in a single year.',
    genres: ['Drama'],
    themes: ['Homecoming', 'Solo performance'],
    year_written: 1992,
    languages: ['English'],
    setting: null,
    hero_image_url: PEXELS(7513421, 1600),
  },
  {
    title: 'Pale Natives',
    slug: 'pale-natives',
    logline: "A comedy of early-'90s white male anxiety, as the ground shifts under two old friends faster than either can keep up.",
    synopsis_short: 'First staged in the early 1990s and revived decades later at the Market Theatre, Pale Natives captures the unease of white South African men navigating a country changing around them.',
    genres: ['Comedy', 'Drama'],
    themes: ['Identity', 'Post-apartheid anxiety'],
    year_written: 1993,
    languages: ['English'],
    setting: null,
    hero_image_url: PEXELS(7991182, 1600),
  },
  {
    title: 'Heel Against the Head',
    slug: 'heel-against-the-head',
    logline: 'Two rugby-mad mates, Tjokkie and Crispin, chase the World Cup all the way to Wales — and find more than sport waiting for them there.',
    synopsis_short: 'A Vita and Star Tonight Best Comedy winner, later adapted by Slabolepszy into a feature film of the same name, following devoted fans Tjokkie and Crispin on a rugby pilgrimage that becomes something bigger.',
    genres: ['Comedy'],
    themes: ['Rugby', 'Friendship'],
    year_written: 1995,
    languages: ['English'],
    setting: 'Wales, during the Rugby World Cup',
    hero_image_url: PEXELS(22908923, 1600),
  },
]

const MEDIA_BY_SLUG = {
  'mooi-street-moves': [
    { type: 'photo', url: PEXELS(11718581, 1200), caption: 'Illustrative image', credit: 'Photo: Linda Gschwentner / Pexels' },
    { type: 'photo', url: PEXELS(18501410, 1200), caption: 'Illustrative image', credit: 'Photo: Daniel Cardoso / Pexels' },
  ],
  'heel-against-the-head': [
    { type: 'photo', url: PEXELS(8462993, 1200), caption: 'Illustrative image', credit: 'Photo: Mart Production / Pexels' },
    { type: 'photo', url: PEXELS(6899791, 1200), caption: 'Illustrative image', credit: 'Photo: Cottonbro Studio / Pexels' },
    {
      type: 'video',
      url: 'https://www.youtube.com/embed/DxauZXqVNpY',
      caption: 'Clip from the 1999 film adaptation of Heel Against the Head',
      credit: null,
    },
  ],
}

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()

  try {
    await db.query('begin')

    const { rows: [writer] } = await db.query(
      "select id from playwrights where slug = 'paul-slabolepszy'",
    )
    if (!writer) throw new Error("playwright 'paul-slabolepszy' not found — run this after M1's seed data exists")

    const updated = await db.query(
      "update plays set hero_image_url = $1 where slug = 'saturday-night-at-the-palace' returning id",
      [PEXELS(12616962, 1600)],
    )
    if (updated.rowCount !== 1) throw new Error('expected exactly one existing play to update')

    for (const play of NEW_PLAYS) {
      const { rows: [inserted] } = await db.query(
        `insert into plays
           (title, slug, logline, synopsis_short, genres, themes, year_written, languages, setting, hero_image_url, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published')
         returning id`,
        [
          play.title, play.slug, play.logline, play.synopsis_short,
          play.genres, play.themes, play.year_written, play.languages,
          play.setting, play.hero_image_url,
        ],
      )
      const playId = inserted.id

      await db.query(
        `insert into play_playwrights (play_id, playwright_id, role, sort) values ($1, $2, 'author', 0)`,
        [playId, writer.id],
      )

      await db.query(
        `insert into rights_availability (play_id, territory, status) values ($1, 'South Africa', 'available')`,
        [playId],
      )

      const media = MEDIA_BY_SLUG[play.slug] ?? []
      for (const [i, m] of media.entries()) {
        await db.query(
          `insert into play_media (play_id, type, url, caption, credit, sort) values ($1,$2,$3,$4,$5,$6)`,
          [playId, m.type, m.url, m.caption, m.credit, i],
        )
      }

      console.log(`seeded: ${play.title} (${playId})`)
    }

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
