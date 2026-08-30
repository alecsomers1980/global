/**
 * Cut web clips from the client's farm video.
 *
 * Source: "Updated Video.mp4" — 136.8s, 1920x1080@30, ~274MB. Kept outside the
 * repo (SOURCE below); only the derived clips are committed.
 *
 * HARD STOP AT 130s. From roughly 130s the video runs an end card carrying the
 * OLD identity — an illustrated well on a brown sign, "FOUNDATIONS FOR FARMING
 * / STEWARDSHIP CENTRE". That is not the current Rehoboth Herbal Co. brand (the
 * one on the logo files and all five product labels), so no clip may include it.
 *
 * In-points below were verified frame-by-frame, not estimated.
 *
 * Run: npm run cut-video
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const SOURCE = process.env.REHOBOTH_VIDEO ?? "C:/tmp/rehoboth-assets/rehoboth-video.mp4";
const OUT = path.join(process.cwd(), "public", "video");
const MAX_BYTES = 1.2 * 1024 * 1024;

/** in = start seconds, dur = duration seconds. All well clear of 130s. */
const CLIPS = [
  // hero-field is the highest-motion shot in the video (workers moving through
  // dense foliage), so it carries its own crf. It also sits behind a dark
  // gradient, which hides the extra compression.
  { name: "hero-field",  in: 26,  dur: 8, crf: 36, note: "workers harvesting artemisia — homepage band" },
  { name: "drying",      in: 63,  dur: 6,  note: "sorting leaf on the drying racks — Our Story" },
  { name: "flowers",     in: 71,  dur: 6,  note: "moringa blossom macro — moringa product page" },
  { name: "milling",     in: 96,  dur: 6,  note: "milling and jarring — Our Story" },
  { name: "capsules",    in: 104, dur: 6,  note: "capsule tray — Our Story" },
];

if (!existsSync(SOURCE)) {
  console.error(`Source video not found: ${SOURCE}`);
  console.error("Set REHOBOTH_VIDEO to its path.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

function run(args) {
  execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
}

let oversize = 0;

for (const clip of CLIPS) {
  if (clip.in + clip.dur > 130) {
    console.error(`${clip.name} would run past 130s into the old end card — refusing.`);
    process.exit(1);
  }

  const mp4 = path.join(OUT, `${clip.name}.mp4`);
  const poster = path.join(OUT, `${clip.name}.jpg`);

  // -an strips audio: these autoplay muted, so the track is dead weight.
  run(["-y", "-v", "error", "-ss", String(clip.in), "-t", String(clip.dur),
       "-i", SOURCE, "-an", "-vf", "scale=960:-2",
       "-c:v", "libx264", "-crf", String(clip.crf ?? 32), "-preset", "slow", "-pix_fmt", "yuv420p",
       "-movflags", "+faststart", mp4]);

  // Poster frame — shown instead of the video under prefers-reduced-motion.
  run(["-y", "-v", "error", "-ss", String(clip.in + 1), "-i", SOURCE,
       "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4", poster]);

  const m = statSync(mp4).size;
  const p = statSync(poster).size;
  if (m > MAX_BYTES) oversize++;
  console.log(
    `${clip.name.padEnd(11)} mp4 ${(m / 1024).toFixed(0).padStart(5)}KB  ` +
    `poster ${(p / 1024).toFixed(0).padStart(4)}KB` +
    `${m > MAX_BYTES ? "  ** OVER BUDGET **" : ""}`
  );
}

if (oversize > 0) {
  console.error(`\n${oversize} clip(s) over the 1.5MB budget — raise crf and re-run.`);
  process.exit(1);
}
console.log("\nAll clips within budget.");
