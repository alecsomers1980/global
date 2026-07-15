/**
 * Aloe Signs — reel render station (Approach A, central operator).
 *
 * Finds published/draft projects that have uploaded clips but no reel yet,
 * downloads the clips from Supabase, stitches a cinematic 16:9 reel (blurred
 * fill for portrait clips, colour grade, cross-dissolves, logo bottom-left,
 * random royalty-free music, no clip audio), uploads the reel + cover back to
 * Supabase, and sets the project's reel_url in the database.
 *
 * Usage:
 *   node render-project.mjs           # render every project awaiting a reel
 *   node render-project.mjs <slug>    # render one project by slug
 *
 * Requires (in .env next to this file): NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, POSTGRES_URL. ffmpeg/ffprobe on PATH (or set
 * FFMPEG / FFPROBE env to their full paths).
 */
import { createClient } from '@supabase/supabase-js';
import { sql } from '@vercel/postgres';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

const HERE = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(HERE, '.env') });
// Fall back to the app's env when run from inside the repo.
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: path.join(HERE, '..', '..', '.env.local') });
}

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FFPROBE || 'ffprobe';
const BUCKET = 'project-media';
const LOGO = existsSync(path.join(HERE, 'assets', 'aloe-logo.png'))
  ? path.join(HERE, 'assets', 'aloe-logo.png')
  : path.join(HERE, '..', '..', 'public', 'aloe-logo.png');
const MUSIC_DIR = path.join(HERE, 'music');
const USED_LOG = path.join(HERE, 'music', '.used.json');
const WORK = path.join(HERE, '.work');

const D = 2.0;          // seconds kept per normal clip
const D_LONG = 3.5;     // the last N_LONG clips (finished-product shots) run longer
const N_LONG = 4;
const D_SECOND_LAST = 6.0; // second-to-last clip
const D_LAST = 10.0;    // the very last clip (final reveal) is held longest
const CF = 0.4;         // crossfade length

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${bin} failed: ${(r.stderr || '').slice(-800)}`);
  return r.stdout;
}

function probeDuration(file) {
  const out = run(FFPROBE, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=duration', '-of', 'default=nokey=1:noprint_wrappers=1', file,
  ]);
  return parseFloat(String(out).replace(/[^0-9.]/g, '')) || D;
}

// Pick a music track that hasn't been used recently (rotate through the pool).
function pickMusic() {
  const tracks = readdirSync(MUSIC_DIR).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f));
  if (tracks.length === 0) throw new Error(`No music in ${MUSIC_DIR} — add royalty-free tracks.`);
  let used = [];
  try { used = JSON.parse(readFileSync(USED_LOG, 'utf8')); } catch {}
  const fresh = tracks.filter((t) => !used.includes(t));
  const pool = fresh.length ? fresh : tracks;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  used = [...used.filter((t) => tracks.includes(t) && t !== chosen), chosen].slice(-Math.max(1, tracks.length - 1));
  try { writeFileSync(USED_LOG, JSON.stringify(used)); } catch {}
  return path.join(MUSIC_DIR, chosen);
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const NORMALISE =
  'split[m][b];[b]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=18[bb];' +
  '[m]scale=1920:1080:force_original_aspect_ratio=decrease[mm];' +
  '[bb][mm]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1,eq=contrast=1.06:saturation=1.12:gamma=0.97,vignette=PI/5,format=yuv420p';

async function renderProject(project) {
  const clips = Array.isArray(project.clips) ? project.clips : [];
  if (clips.length === 0) return;
  console.log(`\n▶ ${project.title} (${project.slug}) — ${clips.length} clips`);

  const dir = path.join(WORK, project.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  // 1. Download + normalise each clip into a graded segment. The last N_LONG
  //    clips are kept longer so the finished-product shots get more dwell time.
  const segs = [];
  const lens = [];
  for (let i = 0; i < clips.length; i++) {
    const keep = i === clips.length - 1 ? D_LAST
      : i === clips.length - 2 ? D_SECOND_LAST
      : i >= clips.length - N_LONG ? D_LONG
      : D;
    const raw = path.join(dir, `raw_${i}.mp4`);
    await download(clips[i], raw);
    const dur = probeDuration(raw);
    const start = Math.max(0, (dur - keep) / 2);
    const seg = path.join(dir, `seg_${String(i).padStart(2, '0')}.mp4`);
    run(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(start), '-t', String(keep), '-i', raw,
      '-filter_complex', `[0:v]${NORMALISE}[v]`, '-map', '[v]', '-an',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', seg]);
    segs.push(seg);
    lens.push(keep);
    process.stdout.write(`  · segment ${i + 1}/${clips.length}\r`);
  }

  // 2. Build the xfade chain + fades + logo + music. Segments have varying
  //    lengths, so each xfade offset is the running total minus k*CF.
  const N = segs.length;
  const totalNum = lens.reduce((a, b) => a + b, 0) - (N - 1) * CF;
  const total = totalNum.toFixed(2);
  const fadeOut = (totalNum - 0.6).toFixed(2);
  const aFadeOut = (totalNum - 1.2).toFixed(2);
  const music = pickMusic();

  const inputs = [];
  for (const s of segs) inputs.push('-i', s);
  inputs.push('-i', LOGO, '-i', music);
  const logoIdx = N;
  const musicIdx = N + 1;

  let f;
  if (N === 1) {
    f = `[0]fade=t=in:st=0:d=0.6,fade=t=out:st=${fadeOut}:d=0.6,format=yuv420p[base]`;
  } else {
    f = '';
    let s = lens[0]; // running sum of segment lengths already placed
    for (let k = 1; k < N; k++) {
      const off = (s - k * CF).toFixed(3);
      f += k === 1
        ? `[0][1]xfade=transition=fade:duration=${CF}:offset=${off}[x1]`
        : `;[x${k - 1}][${k}]xfade=transition=fade:duration=${CF}:offset=${off}[x${k}]`;
      s += lens[k];
    }
    f += `;[x${N - 1}]fade=t=in:st=0:d=0.6,fade=t=out:st=${fadeOut}:d=0.6,format=yuv420p[base]`;
  }
  f += `;[${logoIdx}:v]scale=200:-1[logo];[base][logo]overlay=x=50:y=H-h-50[vout]`;
  f += `;[${musicIdx}:a]atrim=0:${total},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.2,afade=t=out:st=${aFadeOut}:d=1.2,volume=0.9[aout]`;

  const master = path.join(dir, 'master.mp4');
  run(FFMPEG, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', f,
    '-map', '[vout]', '-map', '[aout]', '-t', String(total),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', master]);

  // 3. Web-optimise + cover frame.
  const web = path.join(dir, 'web.mp4');
  run(FFMPEG, ['-y', '-loglevel', 'error', '-i', master, '-c:v', 'libx264', '-preset', 'medium',
    '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '160k', web]);
  const cover = path.join(dir, 'cover.jpg');
  run(FFMPEG, ['-y', '-loglevel', 'error', '-ss', '6', '-i', master, '-frames:v', '1', '-q:v', '3', cover]);

  // 4. Upload + update DB.
  const reelPath = `reels/${project.slug}-reel.mp4`;
  const coverPath = `images/${project.slug}-cover.jpg`;
  const up = async (p, local, ct) => {
    const { error } = await admin.storage.from(BUCKET).upload(p, readFileSync(local), { contentType: ct, upsert: true });
    if (error) throw error;
    return admin.storage.from(BUCKET).getPublicUrl(p).data.publicUrl;
  };
  const reelUrl = await up(reelPath, web, 'video/mp4');
  const coverUrl = await up(coverPath, cover, 'image/jpeg');

  await sql.query(
    `UPDATE projects
       SET reel_url = $1,
           cover_image_url = COALESCE(NULLIF(cover_image_url, ''), $2),
           updated_at = NOW()
     WHERE id = $3`,
    [reelUrl, coverUrl, project.id]
  );

  rmSync(dir, { recursive: true, force: true });
  console.log(`  ✓ reel live: ${reelUrl}`);
}

async function main() {
  const slug = process.argv[2];
  const { rows } = slug
    ? await sql.query(`SELECT id, title, slug, clips, reel_url FROM projects WHERE slug = $1`, [slug])
    : await sql.query(
        `SELECT id, title, slug, clips, reel_url FROM projects
         WHERE jsonb_array_length(COALESCE(clips, '[]'::jsonb)) > 0
           AND (reel_url IS NULL OR reel_url = '')`
      );

  const pending = rows.filter((r) => Array.isArray(r.clips) && r.clips.length > 0 && !r.reel_url);
  if (pending.length === 0) {
    console.log(slug ? `Nothing to render for "${slug}" (no clips, or reel already exists).` : 'No projects awaiting a reel. 🎬');
    return;
  }
  console.log(`Rendering ${pending.length} project(s)…`);
  mkdirSync(WORK, { recursive: true });
  for (const p of pending) {
    try {
      await renderProject(p);
    } catch (err) {
      console.error(`  ✗ ${p.slug}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
