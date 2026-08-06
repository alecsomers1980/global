# Memory Dreaming — nightly/weekly memory maintenance routine

**Status:** approved, ready for implementation plan
**Origin:** [2026-08-05 learning digest](../../../../OneDrive/Documents/Obsidian/Ember%20Automation/logs/2026-08-05-learning-digest.md) (Karpathy "dreaming" video) + [2026-08-06 learning digest](../../../../OneDrive/Documents/Obsidian/Ember%20Automation/logs/2026-08-06-learning-digest.md) (TencentDB Agent Memory, second convergent source)

## Problem

The Claude Code memory store — `~/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/memory/` — has grown to 67 memory files plus a MEMORY.md index, all written in-band, one fact at a time, by whichever session happened to notice something. Nothing has ever pruned or reconciled it. 89 session transcripts sit in the same directory as raw, unused material — evidence that could catch drift, stale entries, and repeated corrections, but nothing reads it back.

Per "improve, don't replace": this is a maintenance layer over the existing memory store, not a new memory system. Scope for v1 is the memory store only — the Obsidian vault is an explicit non-goal, deferred to a later phase once this is proven.

## Architecture

Two scheduled cloud routines via the `schedule` skill, not one branching routine — separate concerns, independently tunable.

### 1. Nightly scanner
- **Schedule:** daily, off-round time (e.g. 2:17am)
- **Reads:** transcripts (`*.jsonl`) written since the last recorded cursor — not a fixed 24h window, so a skipped night doesn't lose data
- **Diffs against:** the 67 memory files + MEMORY.md
- **Auto-applies directly** (no approval needed — mechanical only, never touches claim substance):
  - MEMORY.md index drift: a memory file exists with no index line, or an index line points to a deleted file
  - Typo/grammar fixes inside a memory file's prose
  - `[[wikilink]]` repair, but **only** when exactly one unambiguous target slug matches — ambiguous cases go to the report instead, not autofixed
- **Proposes** (does not apply) everything else — stale entries, repeated corrections, pattern detection, duplicate-file flags — appended to a running `memory/_pending-review.md`, each entry numbered with a verbatim transcript quote as evidence
- **Logs** every auto-applied change to `memory/_dream-log.md` — a visible trail, so nothing rewrites memory silently

### 2. Monday reviewer
- **Schedule:** weekly, Monday morning (~8am)
- **Reads:** the week's accumulated `memory/_pending-review.md`
- **Ends its turn** with the full numbered proposal list as the message body — this is what becomes the push notification. The content itself is in the notification, not a pointer to go check something.
- **You reply** in plain language ("apply 1, 3, skip 2") to continue the same agent
- **On reply:** applies approved changes to the memory files, archives all reviewed entries (approved and rejected) into `memory/_dream-log.md` with the outcome noted, clears `_pending-review.md`

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
                                                          push notification (full list)
                                                                            │
                                                                 reply: "apply 1, 3, skip 2"
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
- A `/review-memory` slash command — the weekly push notification carries the content directly, so there's nothing to remember to run
- Duplicate-file merging (auto-detection only; merging is a proposal, never automatic)

## Testing / verification

No traditional test suite — this is a prompt-driven scheduled routine, not application code. Verification is:
1. Manually trigger one nightly-scanner run (via the Agent tool, `run_in_background: false`) against the real memory store and inspect: did it correctly identify at least one real index-drift case, and did `_dream-log.md` get an entry?
2. Manually trigger one Monday-reviewer run against a `_pending-review.md` seeded with 1–2 real proposals, confirm the notification content includes the quotes, then reply and confirm the memory file is actually edited and the log/pending files update correctly.
3. Let it run for real on schedule for ~1 week before trusting the auto-apply tier unsupervised for longer periods.
