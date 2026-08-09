# /learning-digest — weekly YouTube learning playlist digest

Produce this week's learning digest from the YouTube playlist. Follow these steps exactly.

## 1. Load state

Read `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\reference\learning-playlist.md`:
- the **Playlist URL** (if it still says PASTE-YOUR-PLAYLIST-URL-HERE, stop and tell the user to add their playlist URL to that note)
- the **Processed videos** table (video ids already handled)

## 2. List the playlist

```bash
python -m yt_dlp --flat-playlist --print "%(id)s | %(title)s | %(uploader)s" "<PLAYLIST_URL>"
```

Diff against the processed table **by video ID**, not by row count — the processed table must have one row per video ID for this to work (see the logging rule in step 5). Compute and remember three numbers for the receipt in step 8: **playlist total**, **logged total** (distinct IDs in the processed table), **new** (playlist IDs absent from the table). If `new` is 0, write no digest — just tell the user "no new videos this week" and stop.

## 3. Summarize each new video (max 5 per run; oldest first)

For each new video:
```bash
python -m yt_dlp --skip-download --write-auto-sub --sub-lang en --sub-format vtt -o "<scratchpad>/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=<ID>"
```
Read the `.vtt` (strip timestamps/dedupe lines mentally — read selectively for long ones) and extract:
- What the video teaches (3-6 bullets of concrete techniques, not fluff)
- What's directly applicable to our setup (Claude Code + Obsidian vault + Graphify + multi-model DeepSeek/GLM delegation + client-site work in the Antigravity workspace)
- Effort vs payoff estimate (quick win / project / skip)

If no captions exist, fall back to `--print "%(description)s"` plus a WebSearch for write-ups of the video, and mark the summary as description-based.

**Scene-frame extraction for demo-heavy videos (optional, only when it adds signal):** if a transcript leans on on-screen content the words don't capture — code walkthroughs, UI demos, diagrams, "as you can see here / look at this" with no verbal detail — extract scene-change frames and Read them alongside the transcript:
```bash
python scripts/scene-frames.py <VIDEO_ID> "<scratchpad>/frames-<VIDEO_ID>" 0.4 40
```
It downloads a low-res copy, uses ffmpeg scene detection (one frame per real cut, not fixed-interval), prints the frame paths, and deletes the video. Read a sensible subset of the frames to capture what was shown. Skip this for talking-head/interview videos where the transcript is self-sufficient — it costs bandwidth and time, so use judgement.

## 4. Write the digest

Create `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\logs\YYYY-MM-DD-learning-digest.md` (today's date) with frontmatter (`description`, `type: reference`), one section per video, and a final **"Recommendations to discuss"** section: a ranked shortlist of what's worth adopting, each with a one-line why and rough effort.

**Improve, don't replace:** when a video surfaces a skill/rule/prompt that overlaps one we already own, the recommendation is to *upgrade ours from theirs* — never install both and never swap wholesale. Name the existing asset the upgrade lands in. (Adopted 2026-07-26.)

## 5. Update state

Append each processed video to the Processed table in `reference/learning-playlist.md` with verdict `pending review`. When the user later decides, update verdicts to ADOPTED (link the note) or SKIPPED.

**Never log a batch as a single row.** Every video gets its own row with its own ID, even when several are processed together in one run or one digest. A row like `| date | (40 videos, playlist pos 11-50) | ... |` breaks the ID-based diff in step 2 — those videos will read as "new" on every subsequent run forever, because there's no ID for the diff to match against. (This happened on 2026-07-19 and re-flagged 40 videos as new on 2026-08-09 until it was caught and fixed by expanding the row.)

## 6. Check due wagers

In `reference/learning-playlist.md`, scan the "Adopted so far (with wagers)" table for rows whose **review due** date is today or past and verdict is `pending`. For each, add a **"Wagers due for review"** section to the digest: the practice, its wager, and the evidence you can see (vault logs, memory, recent sessions) for whether it paid off. Do NOT set the verdict yourself — the user decides PAID OFF / PARTIAL / BUST in the review conversation; a BUST means removing the practice's CLAUDE.md rule/skill, not just marking the table.

## 7. Write a run trace

Use the **write-run-logs** skill: write a trace to `logs/traces/learning-digest-YYYY-MM-DD.md` — the steps taken, videos fetched (with counts), any NOSUB/fetch failures, and a one-line numeric **receipt** in the frontmatter. On a "no new videos" run, still write a one-line trace so a silent no-op is distinguishable from a failed run.

## Gotchas

- **Batch rows break the diff (2026-08-09).** See the rule in step 5. If you ever find a run reporting a suspiciously large "new" count that clusters at contiguous playlist positions rather than spanning recent uploads, check for an old batch row before assuming the backlog is real — investigate the cluster, don't just process it.
- **`grep`/shell option parsing on video IDs starting with `-`** (e.g. `-9Iw86Y991E`) will read the ID as a flag and error or silently misbehave. Use `grep -F -e "$id"` (or the equivalent explicit-pattern form in whatever tool you're diffing with), never a bare `grep "$id"`.
- **GitHub stars are not evidence.** Star counts can be bought; when citing a repo as "verified", lead with license + commit recency + maintainer identity, and treat stars as the weakest part of the sentence, not the credibility claim itself.
- **A repo's own headline number can disagree with its own benchmark page.** If a video repeats a repo's marketing claim (e.g. "60-95% savings"), check the repo's actual benchmark data before repeating it in the digest — the two are sometimes written by different people at different times.
- **Non-UTF-8 bytes in yt-dlp title/description output** (curly quotes, em dashes from non-English uploaders) can crash a strict-decode read. Read titles with a tolerant decode (e.g. `errors="replace"`) if scripting over yt-dlp output rather than reading it directly.

## 8. Report

End with an explicit **numeric receipt** (per write-run-logs) that includes the step-2 diff arithmetic so a broken diff is visible instead of silently trusted: e.g. "Playlist 145, logged 145, new 0 — processed N videos, M adopt-candidates, K fetch failures; top rec = …; W wagers due." Not "done". State the digest path and that it's ready to review together.
