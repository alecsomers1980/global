# Aloe Signs — reel render station

Staff upload short clips (or a finished video) when adding a Project on the website.
Those clips go to Supabase. This kit turns them into one cinematic reel and publishes it.

**The loop:** staff upload clips from any PC → someone double-clicks **`Render-Reels.bat`**
on the render station (or Alec runs it) → reels go live. No command line, no monthly cost.

---

## One-time setup on the render station (Andre's or a staff PC)

1. **Install ffmpeg** (adds ffmpeg + ffprobe to PATH):
   ```
   winget install Gyan.FFmpeg
   ```
   Close and reopen the terminal afterwards so PATH updates.
2. **Install Node.js** (LTS) from nodejs.org.
3. **Copy this `scripts/reel/` folder** onto the machine (or clone the repo).
4. In the folder, copy `.env.example` → `.env` and fill in the three keys
   (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_URL`).
5. Open a terminal in the folder and run `npm install` once.
6. Add a few upbeat, royalty-free tracks to the **`music/`** folder (see below).

## Everyday use

- **Double-click `Render-Reels.bat`.** It renders every project that has clips but no
  reel yet, uploads each reel, and publishes it. A window shows progress; close it when done.
- To render one project: `node render-project.mjs <project-slug>`.

## What it produces

Per project: portrait clips centred over a blurred fill → 16:9, colour grade + vignette,
cross-dissolves, fade in/out, **Aloe logo bottom-left** (no glow/line), a random music
track, **clip audio stripped**, web-optimised, plus a cover frame. Then `reel_url` is set
in the database and the reel appears on the live project page.

## Music — IMPORTANT

- Put several tracks in `music/`. The script picks one at random and **rotates so the same
  track isn't reused** back-to-back (tracked in `music/.used.json`).
- For construction / installation footage use **upbeat, masculine** music (energetic /
  sport / epic rock, driving percussion) — not soft corporate.
- Pixabay music is free for commercial use, no attribution. Seeded with "Motivation Epic
  Rock" (alexgrohl); add more so reels vary.

---

## Manual / advanced

`render_reel.sh` + `finalize_reel.sh` are the standalone bash version of the same pipeline
(hard-coded to a clips folder) — handy for one-off custom edits. Tunables live at the top:
`D` = seconds per clip, `CF` = crossfade length; grade via `eq=…` + `vignette`.

`public/images/Projects/` is git-ignored — raw clips and reels never get committed; media
lives on Supabase. Vercel caps API bodies at ~4.5MB, so clips upload straight to Supabase
via signed URLs and reels are always hosted, never pushed through the app.
