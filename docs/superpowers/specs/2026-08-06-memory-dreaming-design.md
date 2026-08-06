# Memory Dreaming — nightly/weekly memory maintenance routine

**Status:** approved, ready for implementation plan
**Origin:** [2026-08-05 learning digest](../../../../OneDrive/Documents/Obsidian/Ember%20Automation/logs/2026-08-05-learning-digest.md) (Karpathy "dreaming" video) + [2026-08-06 learning digest](../../../../OneDrive/Documents/Obsidian/Ember%20Automation/logs/2026-08-06-learning-digest.md) (TencentDB Agent Memory, second convergent source)

## Problem

The Claude Code memory store — `~/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/memory/` — has grown to 67 memory files plus a MEMORY.md index, all written in-band, one fact at a time, by whichever session happened to notice something. Nothing has ever pruned or reconciled it. 89 session transcripts sit in the same directory as raw, unused material — evidence that could catch drift, stale entries, and repeated corrections, but nothing reads it back.

Per "improve, don't replace": this is a maintenance layer over the existing memory store, not a new memory system. Scope for v1 is the memory store only — the Obsidian vault is an explicit non-goal, deferred to a later phase once this is proven.

## Architecture

**Correction (2026-08-06, mid-implementation):** the original draft of this spec assumed the `schedule` skill's cloud routines. Verified during planning that cloud routines run in Anthropic's cloud sandbox and **cannot access local files** — the memory store and session transcripts exist only on the local machine, not in a git repo a cloud routine could clone. Switched to **Windows Task Scheduler running `claude -p` headlessly**, which matches existing precedent (the chat-import script uses the same `schtasks` pattern) and has real local filesystem access. The design itself — cadence, mechanical-only auto-apply boundary, push-notification review flow — is unchanged; only the transport is different.

Two local scheduled tasks via `schtasks`, each invoking `claude -p` non-interactively — separate concerns, independently tunable.

**Unattended execution safety:** both tasks run with `--permission-mode dontAsk` (auto-deny anything not pre-approved — never `--dangerously-skip-permissions`) and a scoped `--allowedTools` allowlist: `Read`/`Write`/`Edit` restricted to the `memory/` directory via `--add-dir`, `Bash` restricted to simple listing/date commands, plus `PushNotification`. This is the technical enforcement of the same "mechanical only, never touches claim substance" boundary already defined below — the process cannot touch anything outside the memory directory even if the prompt were somehow subverted.

### 1. Nightly scanner
- **Schedule:** daily, off-round time (e.g. 2:17am), registered via `schtasks /create`
- **Reads:** transcripts (`*.jsonl`) written since the last recorded cursor — not a fixed 24h window, so a skipped night doesn't lose data
- **Diffs against:** the 67 memory files + MEMORY.md
- **Auto-applies directly** (no approval needed — mechanical only, never touches claim substance):
  - MEMORY.md index drift: a memory file exists with no index line, or an index line points to a deleted file
  - Typo/grammar fixes inside a memory file's prose
  - `[[wikilink]]` repair, but **only** when exactly one unambiguous target slug matches — ambiguous cases go to the report instead, not autofixed
- **Proposes** (does not apply) everything else — stale entries, repeated corrections, pattern detection, duplicate-file flags — appended to a running `memory/_pending-review.md`, each entry numbered with a verbatim transcript quote as evidence
- **Logs** every auto-applied change to `memory/_dream-log.md` — a visible trail, so nothing rewrites memory silently

### 2. Monday reviewer
- **Schedule:** weekly, Monday morning (~8am), registered via `schtasks /create`
- **Reads:** the week's accumulated `memory/_pending-review.md`
- **Sends a short `PushNotification`** (hard 200-char limit on that tool — cannot carry the full list): a one-line teaser with the count, e.g. "3 memory proposals waiting for review"
- **Does not apply anything itself** — a one-shot headless run has no way to wait for a reply mid-task
- **The full list surfaces automatically** at the start of your next Claude Code session (any project), via a global `SessionStart` hook that checks `_pending-review.md` and prints its contents once if non-empty — nothing to type or remember, it's just there next time you're in a session
- **You respond in that session** ("apply 1, 3, skip 2"); the live session applies approved changes to the memory files, archives all reviewed entries (approved and rejected) into `memory/_dream-log.md` with the outcome noted, clears `_pending-review.md`, and the hook goes quiet again until the next non-empty file

## Why nightly + weekly, not one weekly pass

Spreading the transcript read across 7 nights (~9/night at current volume) instead of one weekly pass (~63 at once) keeps each run's context small, directly avoiding the context-rot problem both source digests flagged (Chroma's study: accuracy degrades as input grows, sometimes from ~50k tokens). It also means mechanical drift (a broken index line) gets fixed within a day rather than sitting dirty for a week.

## Data flow

```
transcripts/*.jsonl  ──┐
                        ├─► nightly scanner ─┬─► auto-apply (mechanical) ─► memory/*.md, MEMORY.md
memory/*.md, MEMORY.md ┘                     └─► append proposal ─► memory/_pending-review.md
                                                                            │
                                                          (accumulates over the week)
                                                                            │
                                                                            ▼
                                                                   Monday reviewer
                                                                            │
                                                        push notification (short teaser only)
                                                                            │
                                                       next Claude Code session, any project
                                                                            │
                                                       SessionStart hook prints full list
                                                                            │
                                                                 you reply: "apply 1, 3, skip 2"
                                                                            │
                                                        ┌───────────────────┴──────────────────┐
                                                        ▼                                       ▼
                                          memory/*.md, MEMORY.md updated          memory/_dream-log.md (all outcomes)
                                                                                  memory/_pending-review.md cleared
```

## Error handling

If a nightly run can't read a transcript or hits a conflicting edit, it skips that item, logs the skip to `_dream-log.md`, and continues. No crash, no partial-applied state. Self-healing by construction — the next night's run resumes from the cursor, so a single bad night doesn't compound.

## Cost note

Each nightly run is a real (small) agent invocation with its own usage cost — this is 7 extra scheduled runs/week, not free just because it's automated. Worth a check-in after ~2 weeks of real proposals to confirm the signal-to-cost ratio holds before treating it as permanent infrastructure.

## Non-goals (v1)

- Obsidian vault maintenance (explicitly deferred)
- Any auto-apply beyond the mechanical bar defined above — anything touching claim substance always waits for the Monday reply
- A `/review-memory` slash command — the SessionStart hook surfaces the content automatically, so there's nothing to remember to run
- Cloud routines / the `schedule` skill — ruled out during planning, cannot access local files (see Architecture correction above)
- Duplicate-file merging (auto-detection only; merging is a proposal, never automatic)

## Testing / verification

No traditional test suite — this is a prompt-driven scheduled routine, not application code. Verification is:
1. Manually run the nightly-scanner's exact `claude -p ...` command (from the wrapper script, run directly in a terminal, not yet via schtasks) against the real memory store and inspect: did it correctly identify at least one real index-drift case, did it stay inside the `--allowedTools` boundary, and did `_dream-log.md` get an entry?
2. Manually run the Monday-reviewer's command against a `_pending-review.md` seeded with 1–2 real proposals, confirm the `PushNotification` fires with a short teaser (not a truncation error), then start a fresh session and confirm the `SessionStart` hook prints the full list; reply and confirm the memory file is actually edited and the log/pending files update correctly.
3. Register both via `schtasks /create`, confirm they appear in `schtasks /query`, and let one real nightly cycle run unattended before trusting it further.
