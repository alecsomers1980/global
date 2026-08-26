# /passive-income-digest — weekly passive-income playlist digest (money lens)

Produce this week's passive-income digest from the YouTube playlist. Follow these steps exactly. This mirrors `/learning-digest` but scores through a **money lens**, not a dev-adoption lens.

## 1. Load state

Read `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\reference\passive-income-playlist.md`:
- the **Playlist URL**
- the **Processed videos** table (video ids already handled)

## 2. List the playlist

```bash
python -m yt_dlp --flat-playlist --print "%(id)s | %(title)s" "<PLAYLIST_URL>"
```

Diff against the processed table. If nothing is new, write no digest — tell the user "no new videos this week", still write a one-line trace (step 6), and stop.

## 3. Analyse each new video (max 5 per run; oldest first)

For each new video, fetch and clean the transcript:
```bash
python -m yt_dlp --skip-download --write-auto-subs --sub-lang en --sub-format vtt --no-warnings -o "<scratchpad>/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=<ID>"
```
Strip VTT timestamps/tags and dedupe consecutive lines (an auto-sub cleaner script is fine). Read the cleaned text and extract **concrete, actionable monetization tactics** — the specific offer, price point, workflow, and channel. Not a summary. Ignore hype, giveaways, and course pitches.

If no captions exist, fall back to `--print "%(description)s"` + a WebSearch for write-ups, and mark it description-based.

## 4. Score every tactic against Alec's constraints

Each tactic gets 1-5 on four axes and a verdict:
- **Dev** — does it leverage Alec's coding/automation edge? (higher = more)
- **Boot** — startable under ~$100/mo?
- **USD** — bills in dollars / international?
- **Pass** — leveraged/passive vs time-for-money?
- **Verdict** — ADOPT (map to a [[passive-income-program]] phase), WATCH, or SKIP. Flag any legal/compliance risk (POPIA, platform ToS, disclosure law).

## 5. Write the digest + update backlog

Create `logs/YYYY-MM-DD-passive-income-digest.md` (frontmatter: `description`, `type: reference`, one-line `receipt`), one section per video, plus a ranked **"Recommendations to discuss"**. Append ADOPT/WATCH tactics to `passive-income/idea-backlog.md`. Append each processed video to the Processed table in `reference/passive-income-playlist.md`.

## 6. Write a run trace

Use the **write-run-logs** skill: `logs/traces/passive-income-digest-YYYY-MM-DD.md` — steps, videos fetched (counts), any fetch failures, and a numeric **receipt** in frontmatter. On a no-new-videos run, still write a one-line trace.

## 7. Report

End with an explicit **numeric receipt**: "Processed N videos, M adopt-candidates, K fetch failures; top rec = …". State the digest path.
