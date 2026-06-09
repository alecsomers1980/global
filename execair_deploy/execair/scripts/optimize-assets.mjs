#!/usr/bin/env node
// One-shot asset optimization:
// 1. Resize + convert oversized PNGs in public/images/{icons,projects} to WebP at 1600w max
// 2. Re-encode public/images/videos/HVAC-VIDEO.mp4 to ~720p H.264 (~2 MB target)
// 3. Download remote execair.co.za/wp-content/uploads images referenced in source to public/images/external/
//
// Run: node scripts/optimize-assets.mjs

import sharp from "sharp";
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, readdirSync, statSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 78;
const MIN_BYTES_TO_CONVERT = 600 * 1024; // 600 KB

function fmt(n) {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n > 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

async function convertPngsInDir(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir).filter((f) => /\.png$/i.test(f));
  for (const file of entries) {
    const p = join(dir, file);
    const st = statSync(p);
    if (st.size < MIN_BYTES_TO_CONVERT) continue;
    const out = p.replace(/\.png$/i, ".webp");
    try {
      const meta = await sharp(p).metadata();
      let pipeline = sharp(p);
      if ((meta.width || 0) > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }
      await pipeline.webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(out);
      const newSt = statSync(out);
      console.log(`  ${file}: ${fmt(st.size)} → ${basename(out)} ${fmt(newSt.size)}  (${Math.round((1 - newSt.size / st.size) * 100)}% smaller)`);
    } catch (err) {
      console.error(`  FAILED ${file}: ${err.message}`);
    }
  }
}

async function reencodeVideo() {
  const input = join(PUBLIC, "images/videos/HVAC-VIDEO.mp4");
  if (!existsSync(input)) {
    console.log("  HVAC-VIDEO.mp4 not found, skipping");
    return;
  }
  const output = join(PUBLIC, "images/videos/HVAC-VIDEO.optimized.mp4");
  const ffmpeg = ffmpegInstaller.path;
  const args = [
    "-y",
    "-i", input,
    "-vf", "scale='min(1280,iw)':-2",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "30",
    "-profile:v", "main",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-an",
    output,
  ];
  console.log(`  Running ffmpeg: ${ffmpeg} ${args.slice(0, 4).join(" ")} ...`);
  const result = spawnSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });
  if (result.status !== 0) {
    console.error("  ffmpeg failed:", result.stderr?.toString().slice(-500));
    return;
  }
  const before = statSync(input).size;
  const after = statSync(output).size;
  console.log(`  HVAC-VIDEO.mp4: ${fmt(before)} → optimized ${fmt(after)} (${Math.round((1 - after / before) * 100)}% smaller)`);
  // Replace original with optimized
  renameSync(input, input + ".bak");
  renameSync(output, input);
  console.log("  Replaced original (kept .bak)");
}

const REMOTE_IMAGES = [
  // url, local filename
  ["https://execair.co.za/wp-content/uploads/2023/07/Exec-Air_AboutUs_2023_-2.png", "about-commercial.webp"],
  ["https://execair.co.za/wp-content/uploads/2023/07/Exec-Air_Aboutus_2023_1.png", "about-industrial.webp"],
  ["https://execair.co.za/wp-content/uploads/2023/07/Exec-Air_AboutUs_2023_3.png", "about-residential.webp"],
  ["https://execair.co.za/wp-content/uploads/2023/07/AIR-CONDITIONER-BEING-INSTALLED-1-1024x576.png", "about-installation.webp"],
  ["https://execair.co.za/wp-content/uploads/2024/07/EXEC_AIR_HVAC2-1024x819.png", "ourwork-hvac2.webp"],
  ["https://execair.co.za/wp-content/uploads/2023/08/heavy_industrial_hvac-system-1024x1024.png", "ourwork-heavy-industrial.webp"],
  ["https://execair.co.za/wp-content/uploads/2025/04/exec.png", "threestep-exec.webp"],
];

async function downloadAndConvertRemote() {
  const outDir = join(PUBLIC, "images/external");
  mkdirSync(outDir, { recursive: true });
  for (const [url, name] of REMOTE_IMAGES) {
    const outPath = join(outDir, name);
    if (existsSync(outPath)) {
      console.log(`  ${name}: already exists, skipping`);
      continue;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  ${name}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf).metadata();
      let pipeline = sharp(buf);
      if ((meta.width || 0) > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }
      await pipeline.webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(outPath);
      const newSt = statSync(outPath);
      console.log(`  ${name}: ${fmt(buf.length)} → ${fmt(newSt.size)} (from ${url})`);
    } catch (err) {
      console.error(`  ${name}: failed — ${err.message}`);
    }
  }
}

async function main() {
  console.log("→ Converting PNGs in public/images/icons");
  await convertPngsInDir(join(PUBLIC, "images/icons"));

  console.log("\n→ Converting PNGs in public/images/projects");
  await convertPngsInDir(join(PUBLIC, "images/projects"));

  console.log("\n→ Re-encoding HVAC video");
  await reencodeVideo();

  console.log("\n→ Downloading & converting remote wp-content images");
  await downloadAndConvertRemote();

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
