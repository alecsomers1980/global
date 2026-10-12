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

Diff against the processed table **by video ID**, not by row count — the processed table must have one row per video ID for this to work (see the logging rule in step 5). Extract the IDs from the **video-id column** of every table row, not by matching a whole-row pattern: rows carry date suffixes like `2026-08-09 (re-read)` that a date-anchored regex silently skips, and a silent undercount re-processes videos that were already done. Compute and remember three numbers for the receipt in step 8: **playlist total**, **logged total** (distinct IDs in the processed table), **new** (playlist IDs absent from the table). If `new` is 0, write no digest file — tell the user "no new videos this week" — but do not stop yet: step 6 (due wagers) still runs regardless of `new`, since wager review dates are calendar-driven, not video-driven, and a quiet week must not become a quiet miss on a review that's due today.

**Apply the auto-skip categories here, before fetching anything.** `reference/learning-playlist.md` carries a settled-categories table (adopted 2026-08-22). Any new video whose title plainly falls in a settled category is logged straight to the processed table with a `SKIPPED` verdict and its reason — no transcript download, no read, no write-up — and does not count toward the max-5 in step 3. Honour the table's own exception: a *named* repo that replaces a tool we are **currently paying for** still gets written up. Applying this at step 3 instead costs a full download and read before the skip (observed 2026-08-26).

## 3. Summarize each new video (max 5 per run; oldest first)

For each new video:
```bash
python -m yt_dlp --skip-download --write-auto-sub --sub-lang en --sub-format vtt -o "<scratchpad>/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=<ID>"
```
Clean the `.vtt` with the standing cleaner — `python C:/Users/info/.claude/scripts/vtt2txt.py <scratchpad>/*.en.vtt` (argv-driven, writes `<id>.txt` alongside; **never reuse a previous run's ad-hoc cleaner — older ones hardcode video ids and fail silently**). Sanity-check sizes before reading: under ~2k chars means the clean failed. Then read and extract:
- What the video teaches (3-6 bullets of concrete techniques, not fluff)
- What's directly applicable to our setup (Claude Code + Obsidian vault + Graphify + multi-model DeepSeek/GLM delegation + client-site work in the Antigravity workspace)
- Effort vs payoff estimate (quick win / project / skip)

If no captions exist, fall back to `--print "%(description)s"` plus a WebSearch for write-ups of the video, and mark the summary as description-based. **Same fallback applies when captions exist but the fetch itself won't succeed** (2026-09-04: a per-video `HTTP 429` on the subtitle endpoint survived a retry and a player-client switch while 4 other videos in the same run downloaded cleanly) — don't burn more than one retry chasing a transcript that's rate-limited specifically, not generally.

Scene-frame extraction was retired 2026-10-12 (wager BUST: never used, script lost). For a demo-heavy video, use the description-based fallback and say so in the digest.

## 4. Write the digest

**Check the path is free first — never overwrite.** More than one run can happen on the same day (the 08:00 scheduled task plus a manual `/learning-digest`), and `Write` to an existing digest destroys it silently. If the file already exists, write `logs/YYYY-MM-DD-learning-digest-run2.md` (then `-run3`, ...) and leave the earlier file untouched.

Create `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\logs\YYYY-MM-DD-learning-digest.md` (today's date) with frontmatter (`description`, `type: reference`), one section per video, and a final **"Recommendations to discuss"** section: a ranked shortlist of what's worth adopting, each with a one-line why and rough effort.

**Improve, don't replace:** when a video surfaces a skill/rule/prompt that overlaps one we already own, the recommendation is to *upgrade ours from theirs* — never install both and never swap wholesale. Name the existing asset the upgrade lands in. (Adopted 2026-07-26.)

## 5. Update state

Append each processed video to the Processed table in `reference/learning-playlist.md` with verdict `pending review`. When the user later decides, update verdicts to ADOPTED (link the note) or SKIPPED.

**Never log a batch as a single row.** Every video gets its own row with its own ID, even when several are processed together in one run or one digest. A row like `| date | (40 videos, playlist pos 11-50) | ... |` breaks the ID-based diff in step 2 — those videos will read as "new" on every subsequent run forever, because there's no ID for the diff to match against. (This happened on 2026-07-19 and re-flagged 40 videos as new on 2026-08-09 until it was caught and fixed by expanding the row.)

## 6. Check due wagers

**Runs every time, independent of step 2's video count** (adopted 2026-09-17) — a wager's review date is set once at adoption and doesn't move just because no new video showed up that week. Skipping this on quiet weeks let overdue reviews go unflagged with nothing else to catch them.

In `reference/learning-playlist.md`, scan the "Adopted so far (with wagers)" table for rows whose **review due** date is today or past and verdict is `pending`. For each, surface a **"Wagers due for review"** section: the practice, its wager, and the evidence you can see (vault logs, memory, recent sessions) for whether it paid off. If step 4 produced a digest file, put the section there; on a no-new-videos run, report it directly to the user instead of creating a digest file just to hold it. Do NOT set the verdict yourself — the user decides PAID OFF / PARTIAL / BUST in the review conversation; a BUST means removing the practice's CLAUDE.md rule/skill, not just marking the table.

If the due set matches the last run's trace and no vault log has landed since, point to the last evidence write-up and report only what changed (newly due rows, re-checked facts). Don't rebuild it. Re-surfacing the same 19 rows every day (09-28 through 10-01) produced no verdicts, so the useful ask is a single batch-review session.

## 7. Write a run trace

Use the **write-run-logs** skill: write a trace to `logs/traces/learning-digest-YYYY-MM-DD.md` — the steps taken, videos fetched (with counts), any NOSUB/fetch failures, and a one-line numeric **receipt** in the frontmatter. On a "no new videos" run, still write a one-line trace so a silent no-op is distinguishable from a failed run.

## Gotchas
- **Step-6 wager evidence: count uses, not mentions, and don't trust the status notes in the row (2026-09-30).** Two past reviews gave Alec wrong evidence this way. (1) The 2026-09-19 digest said scene-frames was "used in 13 digest runs". The 13 were grep hits, and nearly all of them say "no scene-frame extraction needed", so real uses since adoption = 0. Read the matched lines before quoting a count. (2) The 2026-09-29 digest said the Everest approval gate "has not landed". It went LIVE on 2026-08-27. The row's note ("client-site copy NOT yet changed") was written before that and never updated. Check the linked note or memory before repeating a row's note as evidence. Also: a row is due when its verdict cell has no PAID OFF / PARTIAL / BUST. Starting with `pending` is not the test, because the Ablate row reads `first pass RUN`. The reverse also happens: 3 rows hold an informal decision in lowercase or prose ("Vault: paid off, keep", "Alec's call 2026-08-17: keep…", "on hold"), plus the system-evolution diagnosis row. An uppercase-only verdict match therefore reports 24 where the real open set is 20 (2026-10-07). Read the verdict cells before reporting the count.
- **`learning-playlist.md` exceeds the Read cap (2026-09-29).** It is ~53k tokens and Read truncates at 25k, so a plain Read shows only the first ~150 lines. Do the step-2 ID extraction and the step-6 wager scan with a script or Grep over the whole file (read the "Adopted so far" table with `offset`), never from the truncated view.
- **A same-day digest may already exist — check before writing (2026-08-19).** The scheduled 08:00 run and a manual `/learning-digest` both target `logs/YYYY-MM-DD-learning-digest.md`. On 2026-08-19 the manual run overwrote the morning run's digest; the vault is **not** a git repo, so the only recovery was OneDrive version history. The processed-table diff is *not* affected (the morning run's 5 IDs were correctly excluded as already-logged) — it is only the digest file that collides, which makes it easy to miss. Always list the target path first and fall back to a `-runN` suffix. The same applies to the trace in step 7.

- **Row-pattern ID extraction under-counts (2026-08-15).** Same failure class as the batch row, different trigger: a `^\| YYYY-MM-DD \| <id> \|` regex missed 4 rows whose date cell reads `2026-08-09 (re-read)`, reporting 155 logged instead of 159. An undercount inflates "new" and re-processes finished videos. Always extract the id **column** (split on `|`, take field 3, keep the 11-char values), never a whole-row pattern.
- **Don't range-limit the extraction to the "## Processed videos" section (2026-08-27).** The processed rows are **not contiguous** — a second cluster of them sits *below* the `## Standing rule` heading (the 2026-08-19 batch), and more can land anywhere. Scanning only from `## Processed videos` to the next heading returned 184 instead of 189 and would have re-processed 5 finished videos. Extract the id column from the **whole file**: any 11-char field-3 value is a logged video, and the handful of non-video tables below don't produce false positives.
- **Bash's `/tmp` and Windows Python's `/tmp` are two different directories (2026-09-07).** If you script the step-2 diff in Python and hand it a path the Bash tool wrote via `/tmp/...`, don't pass that bare POSIX path to `io.open()` — MSYS only auto-translates `/tmp/...` to the real Windows path for arguments given to a native exe *on the command line*; a string literal inside a Python heredoc never gets that translation, so `python.exe` resolves it internally to `C:\tmp\...` — a separate, non-empty directory that already held a stale same-named file from a previous run. Every current-run ID silently diffed against 31-day-old data and all 222 playlist videos read as "new" (would have re-triggered the entire backlog, the worst-case version of the under-count bugs below). Avoid the ambiguity rather than debug it: run yt-dlp as a `subprocess` inside the same Python process (no intermediate file), or use the explicit Windows path (`C:/tmp/...`) on both the write and read side.
- **Batch rows break the diff (2026-08-09).** See the rule in step 5. If you ever find a run reporting a suspiciously large "new" count that clusters at contiguous playlist positions rather than spanning recent uploads, check for an old batch row before assuming the backlog is real — investigate the cluster, don't just process it.
- **`grep`/shell option parsing on video IDs starting with `-`** (e.g. `-9Iw86Y991E`) will read the ID as a flag and error or silently misbehave. Use `grep -F -e "$id"` (or the equivalent explicit-pattern form in whatever tool you're diffing with), never a bare `grep "$id"`.
- **A pattern-based `\| [A-Za-z0-9_-]{11} \|` extraction over-counts when a title itself contains a pipe (2026-09-17).** Some titles embed a `Video Title - Channel A | Channel B` style credit, and a channel name that happens to be exactly 11 word-characters (observed: `RoboNuggets`) reads as a false video-id match — it sits between two pipe characters just like a real id column would. This is the inverse failure of the under-count gotchas above: same regex-over-title-text root cause, opposite direction. Sanity-check any extracted "id" against the real 11-char YouTube id alphabet expectations you can rule out on sight (e.g. an all-alpha, no-digit, no-hyphen/underscore string spanning a whole word is worth a second look), or diff against a second extraction method before trusting a count.
- **GitHub stars are not evidence.** Star counts can be bought; when citing a repo as "verified", lead with license + commit recency + maintainer identity, and treat stars as the weakest part of the sentence, not the credibility claim itself.
- **"Open source" in a video is not a licence — check the LICENSE file (2026-08-17).** Presenters routinely say "it's all open source, use my source code as a blueprint" about repos that grant no reuse rights at all (`MengTo/kage`: *"No license granted for reuse of original code or artwork"*, 202 forks notwithstanding; `coleam00/dark-factory-experiment`: no licence stated). **Source-available is not open-source; absent licence = all rights reserved.** Always state a repo's actual licence in the digest, and flag it explicitly when a video's reuse claim and the repo disagree — that gap is a finding, not a footnote. See [[feedback_licence_check_before_lifting]].
- **A repo's own headline number can disagree with its own benchmark page.** If a video repeats a repo's marketing claim (e.g. "60-95% savings"), check the repo's actual benchmark data before repeating it in the digest — the two are sometimes written by different people at different times.
- **Google Search Central blog posts fetch as nav-only (2026-08-31).** `WebFetch` on a `developers.google.com/search/blog/...` URL returned the archive listing and side navigation, not the post body — the verification looked like a dead end when the facts were actually available. Fetch the underlying documentation page instead (for policy changes, `developers.google.com/search/docs/essentials/spam-policies`), which carries the same wording plus the worked examples; cross-check with Search Engine Land / Roundtable / Journal coverage for Google's direct quotes.

- **Non-UTF-8 bytes in yt-dlp title/description output** (curly quotes, em dashes from non-English uploaders) can crash a strict-decode read. Read titles with a tolerant decode (e.g. `errors="replace"`) if scripting over yt-dlp output rather than reading it directly. The same applies on the way *out*: printing vault text (arrows, em dashes) from Python crashes on Windows' cp1252 stdout — run with `PYTHONIOENCODING=utf-8` (2026-09-26).
- **Plain `--write-auto-sub` can hit `HTTP Error 429` + "Sign in to confirm you're not a bot" (2026-08-28).** The step-3 command as written failed on the first video of the run with a 429 from the webpage fetch, even though step-2's `--flat-playlist` call on the same playlist succeeded seconds earlier. Add `--extractor-args "youtube:player_client=android"` to the step-3 command — it bypasses the webpage fetch that's getting rate-limited/bot-checked and downloaded cleanly on all 5 videos this run. Try it as the default for step 3, not just a retry-on-failure.
- **A 429 that reads `Unable to download video subtitles` on *every* video is a different failure — an IP block on the timedtext endpoint (2026-09-21, passive-income run 10).** `player_client=android` does not help there, nor does any other client, `youtube-transcript-api`, or a short wait. One retry, then the description + chapters + companion-write-up fallback for the whole batch; see the passive-income-digest Gotchas for the full list of what was tried.

## 8. Report

End with an explicit **numeric receipt** (per write-run-logs) that includes the step-2 diff arithmetic so a broken diff is visible instead of silently trusted: e.g. "Playlist 145, logged 145, new 0 — processed N videos, M adopt-candidates, K fetch failures; top rec = …; W wagers due." Not "done". State the digest path and that it's ready to review together.
