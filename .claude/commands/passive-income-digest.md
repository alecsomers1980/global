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
Clean the `.vtt` with the standing cleaner — `python C:/Users/info/.claude/scripts/vtt2txt.py <scratchpad>/*.en.vtt` (argv-driven, writes `<id>.txt` alongside). **Do not reuse an ad-hoc cleaner from a previous run's scratch dir** — older ones have video ids hardcoded and will silently emit that run's output instead of failing. Sanity-check the sizes before reading: a real transcript is ~10-50k chars; anything under ~2k means the clean failed. Read the cleaned text and extract **concrete, actionable monetization tactics** — the specific offer, price point, workflow, and channel. Not a summary. Ignore hype, giveaways, and course pitches.

If no captions exist, fall back to `--print "%(description)s"` + a WebSearch for write-ups, and mark it description-based.
**Before the description fallback, try audio + local Whisper** (worked 2026-10-22 while the subtitle endpoint 429'd): `yt-dlp -q -f "ba[ext=m4a]/ba" -o audio.%(ext)s <url>` still downloads, then faster-whisper `mobiuslabsgmbh/faster-whisper-large-v3-turbo` int8 on CPU (`python -I` needs `sys.path.append(site.getusersitepackages())`) transcribes a 12-min video in a few minutes. Run it in the background. Fall back to description-only only if the audio download fails too.


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

## Gotchas

- **`HTTP Error 429` on the *subtitle* download for every video = IP-level block on YouTube's timedtext endpoint, not the webpage bot-check (2026-09-21).** Distinguish the two: the 2026-08-28 learning-digest fix (`--extractor-args "youtube:player_client=android"`) only bypasses the *webpage* fetch; when the 429 says `Unable to download video subtitles`, no player client helps (android/ios/mweb/tv/web_safari all tried), `youtube-transcript-api` reports `IpBlocked`, `--cookies-from-browser` fails while Edge/Chrome are open, and a yt-dlp upgrade + 15-min wait didn't clear it. Spend at most one retry, then go straight to the step-3 fallback for the whole batch: `--print "%(description)s"` + `%(chapters)s` for structure, then WebSearch for a **companion write-up** — the platform's own blog post about the episode (Vendasta did one), the creator's newsletter/X essay, or a third-party critique — which is often near-transcript quality. Mark each video *description-based* or *write-up-based* in the digest, the Processed table, and the receipt.
- **One subtitle 429 is not the batch-wide block — try every video once before falling back (2026-10-05).** The 2026-09-28 run hit a 429 on the first video and, reading the gotcha above, skipped subtitle fetches for the other four. On 2026-10-05, 4 of 5 downloaded cleanly and only one (`wudOmpK-8Fk`) 429'd, twice. That's per-video throttling, the same failure learning-digest saw on 2026-09-04. Loop over all videos with one attempt each, retry only the failures once, and fall back per video. Treat it as the IP block (whole-batch fallback) only when **every video fails on the first pass**. The earlier "first two in a row" test was wrong: on 2026-10-19 videos 1 and 2 both 429'd, then videos 3 and 4 downloaded cleanly.
- **Before the description fallback, try Firecrawl's `youtube-com/videos/video_transcript` provider (2026-10-20).** It runs from Firecrawl's network, so our IP block doesn't apply. It worked for 1 of 2 videos on learning-digest 10-20, and the other returned a 502. Call shape and parsing traps are in the learning-digest Gotchas. **Try it before audio + Whisper, and retry 502s once (2026-10-26).** Send every yt-dlp failure in one call (~5 credits per video). On 10-26, 3 of 4 came back `502 provider_error`, and an immediate second call with just those 3 returned all 3. Whisper on an 88-min interview would have taken far longer. `full_text` comes back as a single line, so run `fold -s -w 1500` on it before reading it with Read.
- **For write-up fallback, search `income-reality-check.pages.dev` first (2026-10-12).** It publishes a per-video critique of this genre (side-hustle / "making people RICH" videos): the full product or tactic list plus fees, platform rules and realistic earnings. That's closer to transcript quality than the description. On 2026-10-12 it covered `eLAQkZx5QkE`; podcast-summary sites (podcastrex) returned "unavailable". A retry spaced 20s apart did not clear per-video 429s, so don't spend longer waits on them. **Fetch the article URL directly rather than searching (2026-10-19):** it's `/a/<title-slug>/`, the title lower-cased with punctuation dropped and spaces as hyphens (e.g. `/a/the-most-overlooked-online-side-hustle-of-2026/`). A slug that doesn't exist returns the site index with HTTP 200, not a 404. So a successful fetch proves nothing until the page names the video's creator or tactics. WebSearch didn't index the site at all.
- **Check each new video's channel against earlier digests before counting convergence (2026-10-19).** Creators come back with a reshuffled version of the same list. On 2026-10-19, two of five were repeats: JP Middleton (`MXe1xNEuOZ8` = v40's franchise + "seven exits" talk) and Patrick Dang (`XxWqn2QB-oM` = v37's ranked list on the same 25-point rubric). Get the channel with `--print "%(channel)s"`, then grep the digests for it. A repeat from the same creator is a duplicate, not another independent vote for a tactic. Only votes from different creators raise a convergence count ("4th vote for…"). **On interview channels, the guest is the source (2026-10-26).** The Calum Johnson Show (v42 Jack Roberts, v67 Seth Godin) and The Next New Thing (v51 a guest interview, v71 the host's own roundup) came back with different people and different material, so each counts as independent. A host's solo episode gets judged on its content, not its channel name.
- **yt-dlp warns "No supported JavaScript runtime could be found" (2026-10-05).** It's harmless for now: listing, subtitles and descriptions all worked. If extraction later starts failing or returning missing formats, install deno or pass `--js-runtimes node` (Node v24 is installed) before debugging anything else.
