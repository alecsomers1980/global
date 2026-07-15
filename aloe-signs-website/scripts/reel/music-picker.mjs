/**
 * Shared music-rotation logic used by both render-project.mjs (clips pipeline)
 * and the standalone render_reel.sh/finalize_reel.sh scripts (via pick-music.mjs).
 * Keeps every reel — however it was produced — drawing from the same pool and
 * the same "don't repeat too soon" history.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MUSIC_DIR = path.join(HERE, 'music');
const USED_LOG = path.join(MUSIC_DIR, '.used.json');

// Don't repeat a track until this many other renders have used something else
// (i.e. reuse is only allowed again from the 10th render onward).
export const MUSIC_HISTORY = 9;

export function pickMusic() {
  const tracks = readdirSync(MUSIC_DIR).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f));
  if (tracks.length === 0) throw new Error(`No music in ${MUSIC_DIR} — add royalty-free tracks.`);

  let log = [];
  try { log = JSON.parse(readFileSync(USED_LOG, 'utf8')); } catch {}

  const excludeCount = Math.min(MUSIC_HISTORY, tracks.length - 1);
  const recentlyUsed = log.slice(-excludeCount);
  const pool = tracks.filter((t) => !recentlyUsed.includes(t));
  const choices = pool.length ? pool : tracks;
  const chosen = choices[Math.floor(Math.random() * choices.length)];

  log = [...log, chosen].slice(-200); // bounded history log
  try { writeFileSync(USED_LOG, JSON.stringify(log)); } catch {}

  return path.join(MUSIC_DIR, chosen);
}
