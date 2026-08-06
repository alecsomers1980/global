# Memory Dreaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a nightly/weekly local maintenance routine over the Claude Code memory store that auto-fixes mechanical drift and surfaces everything else for approval, with nothing to remember to run.

**Architecture:** Two Windows Task Scheduler jobs invoke `claude -p` headlessly against hand-written prompt files, scoped to `dontAsk` permission mode with an explicit `--bare` + `--settings` allowlist (no inherited global permissions). A global `SessionStart` hook surfaces any pending proposals at the start of the next Claude Code session.

**Tech Stack:** Windows `schtasks`, PowerShell wrapper scripts, `claude -p` (headless Claude Code), Python (hook script, matching the existing `block-env-edits.py` precedent), plain markdown/JSON state files.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-memory-dreaming-design.md` — v1 scope is `memory/*.md` + `MEMORY.md` only, Obsidian vault explicitly deferred.
- Never `--dangerously-skip-permissions` or `--allow-dangerously-skip-permissions`. Unattended runs use `--permission-mode dontAsk` with an explicit allowlist only.
- All Task Scheduler commands use absolute paths (relative paths are unreliable under Task Scheduler per verified Claude Code docs).
- Memory paths referenced throughout: `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\` (the store) and `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\` (transcripts, `*.jsonl`, one level up from the store).
- Per user instruction: PowerShell wrapper scripts and the Python hook script are generated via `node opencode-glm-extension/ds-agent.js '<prompt>'` (DeepSeek delegation) run from the Antigravity repo root — Claude acts as architect (writing the exact contract each file must satisfy), DeepSeek writes the code. Each such task states the exact prompt to use and the exact contract to verify the output against.

---

## File Structure

```
automation/memory-dreaming/
  nightly-scanner-prompt.md      — already written (this session) — the nightly agent's instructions
  monday-reviewer-prompt.md      — already written (this session) — the weekly agent's instructions
  claude-settings-rw.json        — permission allowlist for the nightly run (Read/Write/Edit on memory/, read on transcripts)
  claude-settings-ro.json        — permission allowlist for the Monday run (read-only + PushNotification, no Write/Edit)
  run-nightly.ps1                — wrapper script Task Scheduler invokes
  run-monday.ps1                 — wrapper script Task Scheduler invokes
  logs/                          — wrapper script output, one file per run (created by the scripts, not committed)
  README.md                      — how to install/test/uninstall the two scheduled tasks

C:\Users\info\.claude\hooks\surface-pending-memory-review.py   — SessionStart hook (global, alongside the existing block-env-edits.py)

C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-cursor.json     — cursor state (created in Task 1)
C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_pending-review.md     — proposal queue (created in Task 1)
C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-log.md          — audit trail (created in Task 1)

C:\Users\info\.claude\settings.json — edited in Task 8 to register the SessionStart hook
```

---

### Task 1: Create initial memory-store state files

**Files:**
- Create: `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-cursor.json`
- Create: `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_pending-review.md`
- Create: `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-log.md`

**Interfaces:**
- Produces: the cursor schema `{"last_processed_utc": string|"", "next_proposal_number": integer}` that Task 2's prompt reads and writes.
- Produces: the `_pending-review.md` numbered-entry format (`## N. <title>` sections) that Task 2's prompt appends to and Task 5's prompt counts.
- Produces: the `_dream-log.md` line format (`- YYYY-MM-DD HH:MM UTC — auto-applied|skipped — ...`) that Task 2's prompt appends to.

- [ ] **Step 1: Create the cursor file with an empty starting state**

```json
{"last_processed_utc": "", "next_proposal_number": 1}
```

- [ ] **Step 2: Create the empty pending-review file**

```markdown
# Pending memory review
```

- [ ] **Step 3: Create the empty dream log**

```markdown
# Dream log

Auto-applied mechanical fixes and skipped/errored items, newest last.
```

- [ ] **Step 4: Verify all three exist**

Run: `dir "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream*.* " "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_pending-review.md"`
Expected: all three files listed.

- [ ] **Step 5: Commit**

The state files live outside the git repo (in `~/.claude/`), so there's nothing to commit for this task — skip.

---

### Task 2: Write the nightly scanner prompt (already done)

The prompt was written during the brainstorming/planning session at `automation/memory-dreaming/nightly-scanner-prompt.md`. No further action — this task exists only so later tasks can reference it by number.

- [ ] **Step 1: Confirm the file exists and matches the contract**

Run: `Get-Content "automation/memory-dreaming/nightly-scanner-prompt.md" | Select-Object -First 5`
Expected: starts with "You are the nightly memory-dreaming scanner..."

---

### Task 3: Write the Monday reviewer prompt (already done)

Same as Task 2 — written at `automation/memory-dreaming/monday-reviewer-prompt.md` during planning.

- [ ] **Step 1: Confirm the file exists and matches the contract**

Run: `Get-Content "automation/memory-dreaming/monday-reviewer-prompt.md" | Select-Object -First 5`
Expected: starts with "You are the weekly memory-dreaming reviewer..."

---

### Task 4: Write the two permission settings files

**Files:**
- Create: `automation/memory-dreaming/claude-settings-rw.json`
- Create: `automation/memory-dreaming/claude-settings-ro.json`

**Interfaces:**
- Produces: the two `--settings` files Task 5 and Task 7's wrapper scripts pass to `claude -p --bare`.

- [ ] **Step 1: Write the read-write settings file (nightly scanner)**

```json
{
  "permissions": {
    "allow": [
      "Read(C:/Users/info/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/memory/**)",
      "Write(C:/Users/info/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/memory/**)",
      "Edit(C:/Users/info/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/memory/**)",
      "Read(C:/Users/info/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/*.jsonl)",
      "Glob",
      "Bash(date *)"
    ]
  },
  "permissionMode": "dontAsk"
}
```

- [ ] **Step 2: Write the read-only settings file (Monday reviewer)**

```json
{
  "permissions": {
    "allow": [
      "Read(C:/Users/info/.claude/projects/c--Users-info-OneDrive-Documents-Antigravity/memory/_pending-review.md)",
      "PushNotification"
    ]
  },
  "permissionMode": "dontAsk"
}
```

- [ ] **Step 3: Verify both are valid JSON**

Run: `Get-Content automation/memory-dreaming/claude-settings-rw.json | ConvertFrom-Json | Out-Null; Get-Content automation/memory-dreaming/claude-settings-ro.json | ConvertFrom-Json | Out-Null; "both valid"`
Expected: prints `both valid` with no error.

- [ ] **Step 4: Commit**

```bash
git add automation/memory-dreaming/claude-settings-rw.json automation/memory-dreaming/claude-settings-ro.json automation/memory-dreaming/nightly-scanner-prompt.md automation/memory-dreaming/monday-reviewer-prompt.md
git commit -m "feat: memory dreaming permission settings + prompts"
```

---

### Task 5: Generate and test the nightly scanner wrapper script

**Files:**
- Create: `automation/memory-dreaming/run-nightly.ps1`
- Create: `automation/memory-dreaming/logs/` (directory, created by the script on first run)

**Interfaces:**
- Consumes: `automation/memory-dreaming/nightly-scanner-prompt.md` (Task 2), `automation/memory-dreaming/claude-settings-rw.json` (Task 4)
- Produces: an executable PowerShell script Task 6 registers with `schtasks`.

- [ ] **Step 1: Generate the script via DeepSeek**

Run from the Antigravity repo root:

```bash
node opencode-glm-extension/ds-agent.js 'Write a Windows PowerShell script saved as automation/memory-dreaming/run-nightly.ps1. Requirements:
1. Set $ErrorActionPreference = "Stop".
2. Read the full text content of "automation/memory-dreaming/nightly-scanner-prompt.md" (resolve relative to the script location using $PSScriptRoot, not the current working directory) into a variable.
3. Build and run this exact command, using absolute paths resolved from $PSScriptRoot: claude --bare -p "<prompt text from step 2>" --add-dir "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory" --add-dir "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity" --settings "$PSScriptRoot\claude-settings-rw.json" --allowedTools "Read Write Edit Glob Bash(date *)" --output-format text
4. Redirect both stdout and stderr of that command to a log file at "$PSScriptRoot\logs\nightly-<yyyy-MM-dd-HHmmss>.log" (create the logs directory first if it does not exist).
5. Exit the script with the same exit code claude.exe returned.
Output ONLY the raw PowerShell code, no markdown fences, no commentary.'
```

Save the output to `automation/memory-dreaming/run-nightly.ps1`.

- [ ] **Step 2: Verify the generated script against contract**

Read `automation/memory-dreaming/run-nightly.ps1` and confirm all of:
- Uses `$PSScriptRoot` for all relative paths (not the invocation-time working directory)
- Calls `claude --bare -p` (not plain `claude -p` — `--bare` is required to avoid inheriting the global `~/.claude/settings.json` permission allowlist)
- Passes `--settings` pointing at `claude-settings-rw.json`
- Does **not** contain `--dangerously-skip-permissions` or `--allow-dangerously-skip-permissions` anywhere
- Writes a log file and exits with claude's exit code

If any of these are missing, fix them directly (Edit) rather than re-running the generator — the contract check exists precisely so a bad generation doesn't silently ship.

- [ ] **Step 3: Manually run the script once**

Run: `powershell -ExecutionPolicy Bypass -File "automation/memory-dreaming/run-nightly.ps1"`
Expected: exits 0. Check the newest file in `automation/memory-dreaming/logs/` — it should show the agent reading the cursor, finding new transcripts (or "nothing new" if none exist since the cursor's 48h fallback), and either applying mechanical fixes or reporting none found.

- [ ] **Step 4: Verify real file effects**

Run: `Get-Content "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-cursor.json"`
Expected: `last_processed_utc` has moved forward from `""` to a real timestamp (assuming at least one transcript existed in the lookback window — this workspace has 89+, so it will).

Run: `Get-Content "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-log.md"`
Expected: at least one line was appended (either an auto-apply or, if nothing mechanical was found, the file may still be unchanged beyond the header — that's a valid outcome, not a failure).

- [ ] **Step 5: Commit**

```bash
git add automation/memory-dreaming/run-nightly.ps1
git commit -m "feat: nightly memory-dreaming scanner wrapper script"
```

(The `logs/` directory itself should not be committed — add `automation/memory-dreaming/logs/` to `.gitignore` if it isn't already covered by an existing ignore rule.)

---

### Task 6: Register the nightly scanner as a scheduled task

**Files:**
- Modify: none (registers with Windows Task Scheduler directly, not a repo file)

**Interfaces:**
- Consumes: `automation/memory-dreaming/run-nightly.ps1` (Task 5)

- [ ] **Step 1: Register via schtasks**

```powershell
schtasks /create /tn "MemoryDreamingNightly" /tr "powershell.exe -ExecutionPolicy Bypass -File `"C:\Users\info\OneDrive\Documents\Antigravity\automation\memory-dreaming\run-nightly.ps1`"" /sc daily /st 02:17 /ru "%USERNAME%" /rl LIMITED /f
```

- [ ] **Step 2: Verify registration**

Run: `schtasks /query /tn "MemoryDreamingNightly" /v /fo LIST`
Expected: shows `Status: Ready`, `Schedule: Daily`, `Start Time: 2:17:00 AM`.

- [ ] **Step 3: Trigger it once through Task Scheduler itself (not just PowerShell directly) to confirm the registration works end to end**

Run: `schtasks /run /tn "MemoryDreamingNightly"`
Wait ~10 seconds, then run: `schtasks /query /tn "MemoryDreamingNightly" /v /fo LIST` and check `Last Result: 0`.
Expected: `Last Result: 0` (success). Also check `automation/memory-dreaming/logs/` for a new log file with a timestamp matching this run.

No commit — Task Scheduler registration is machine state, not repo state. Note it in the README (Task 9).

---

### Task 7: Generate and test the Monday reviewer wrapper script

**Files:**
- Create: `automation/memory-dreaming/run-monday.ps1`

**Interfaces:**
- Consumes: `automation/memory-dreaming/monday-reviewer-prompt.md` (Task 3), `automation/memory-dreaming/claude-settings-ro.json` (Task 4)

- [ ] **Step 1: Generate the script via DeepSeek**

```bash
node opencode-glm-extension/ds-agent.js 'Write a Windows PowerShell script saved as automation/memory-dreaming/run-monday.ps1. Requirements:
1. Set $ErrorActionPreference = "Stop".
2. Read the full text content of "automation/memory-dreaming/monday-reviewer-prompt.md" (resolve relative to the script location using $PSScriptRoot) into a variable.
3. Build and run this exact command, using absolute paths resolved from $PSScriptRoot: claude --bare -p "<prompt text from step 2>" --add-dir "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory" --settings "$PSScriptRoot\claude-settings-ro.json" --allowedTools "Read PushNotification" --output-format text
4. Redirect both stdout and stderr to a log file at "$PSScriptRoot\logs\monday-<yyyy-MM-dd-HHmmss>.log" (create the logs directory first if it does not exist).
5. Exit the script with the same exit code claude.exe returned.
Output ONLY the raw PowerShell code, no markdown fences, no commentary.'
```

Save to `automation/memory-dreaming/run-monday.ps1`.

- [ ] **Step 2: Verify against contract**

Same checklist as Task 5 Step 2, plus: confirm it points at `claude-settings-ro.json` (not the read-write file) and does **not** grant `Write` or `Edit` in the `--allowedTools` list.

- [ ] **Step 3: Seed a test proposal and run manually**

Append a test entry to `_pending-review.md` so there's something to count:

```powershell
Add-Content "C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_pending-review.md" "`n## 1. Test entry for manual verification`n`n**Evidence:** manual test, not a real proposal.`n`n**Proposal:** delete this test entry after verifying the notification fires.`n`n**Affects:** none (test only)"
```

Run: `powershell -ExecutionPolicy Bypass -File "automation/memory-dreaming/run-monday.ps1"`
Expected: exits 0, and a desktop notification appears with text matching `1 memory proposals waiting for review — open Claude Code to see them.` (exact count reflects however many `## N.` entries exist).

- [ ] **Step 4: Remove the test entry**

Manually edit `_pending-review.md` to remove the test entry added in Step 3, leaving the file as it was after Task 5's real run (or back to just the header if Task 5 found nothing to propose).

- [ ] **Step 5: Commit**

```bash
git add automation/memory-dreaming/run-monday.ps1
git commit -m "feat: Monday memory-dreaming reviewer wrapper script"
```

---

### Task 8: Register the Monday reviewer as a scheduled task

**Files:**
- Modify: none (Task Scheduler registration)

**Interfaces:**
- Consumes: `automation/memory-dreaming/run-monday.ps1` (Task 7)

- [ ] **Step 1: Register via schtasks**

```powershell
schtasks /create /tn "MemoryDreamingMondayReview" /tr "powershell.exe -ExecutionPolicy Bypass -File `"C:\Users\info\OneDrive\Documents\Antigravity\automation\memory-dreaming\run-monday.ps1`"" /sc weekly /d MON /st 08:03 /ru "%USERNAME%" /rl LIMITED /f
```

- [ ] **Step 2: Verify registration**

Run: `schtasks /query /tn "MemoryDreamingMondayReview" /v /fo LIST`
Expected: `Schedule: Weekly`, `Days: MON`, `Start Time: 8:03:00 AM`.

No commit — machine state, noted in the README (Task 9).

---

### Task 9: Generate and install the SessionStart hook

**Files:**
- Create: `C:\Users\info\.claude\hooks\surface-pending-memory-review.py`
- Modify: `C:\Users\info\.claude\settings.json:1045-1061` (the existing `hooks` object)

**Interfaces:**
- Consumes: `_pending-review.md`'s numbered-entry format (Task 1's contract)
- Produces: stdout text that Claude Code's `SessionStart` handling automatically adds to context (no JSON wrapping needed for the plain case, per verified docs).

- [ ] **Step 1: Generate the hook script via DeepSeek**

```bash
node opencode-glm-extension/ds-agent.js 'Write a Python 3 script saved as a SessionStart hook for Claude Code, matching the style of this existing hook (stdlib only, no dependencies, reads hook JSON from stdin, silent unless it has something to say, never raises on malformed input):

```python
#!/usr/bin/env python3
"""PreToolUse guardrail: block Write/Edit to .env secret files."""
import json
import os
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
```

Requirements for the new script:
1. Read (and discard — no fields are needed from it) the JSON hook input on stdin, same defensive try/except pattern as the example (exit 0 silently on parse failure).
2. Read the file at "C:\\Users\\info\\.claude\\projects\\c--Users-info-OneDrive-Documents-Antigravity\\memory\\_pending-review.md".
3. If the file does not exist, or exists but contains no line matching the regex ^## \\d+\\. (i.e. no numbered proposal entries), exit 0 with no output.
4. Otherwise, print the full raw file contents to stdout and exit 0. Plain stdout is automatically added to session context for SessionStart hooks, so no JSON wrapping is needed.
5. Wrap the file read in try/except too — exit 0 silently on any read error, never raise, never print a traceback (this runs on every single session start, it must never break a session).
Output ONLY the raw Python code, no markdown fences, no commentary.'
```

Save to `C:\Users\info\.claude\hooks\surface-pending-memory-review.py`.

- [ ] **Step 2: Verify against contract**

Read the generated file and confirm: stdlib-only imports, defensive try/except around both the stdin JSON read and the file read, exits 0 in every branch (never a non-zero exit, never an unhandled exception), and prints nothing when there are no `## N.` entries.

- [ ] **Step 3: Test the hook script directly**

With the real `_pending-review.md` from Task 5/7 testing (should currently be back to just the header, i.e. no entries):

Run: `echo '{}' | python "C:\Users\info\.claude\hooks\surface-pending-memory-review.py"`
Expected: no output, exit code 0.

Temporarily re-add the test entry from Task 7 Step 3, then:

Run: `echo '{}' | python "C:\Users\info\.claude\hooks\surface-pending-memory-review.py"`
Expected: prints the full file contents including `## 1. Test entry for manual verification`.

Remove the test entry again afterward.

- [ ] **Step 4: Register the hook in global settings.json**

Read `C:\Users\info\.claude\settings.json`, find the existing `"hooks": { "PreToolUse": [...] }` block (currently lines 1045–1061), and add a sibling `SessionStart` key so the block becomes:

```json
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python",
            "args": [
              "C:\\Users\\info\\.claude\\hooks\\block-env-edits.py"
            ],
            "statusMessage": "Checking env-file guardrail..."
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python",
            "args": [
              "C:\\Users\\info\\.claude\\hooks\\surface-pending-memory-review.py"
            ],
            "statusMessage": "Checking for pending memory review..."
          }
        ]
      }
    ]
  },
```

Use Edit, not a full rewrite of the file — it's 1100+ lines and the rest must stay untouched.

- [ ] **Step 5: End-to-end verification**

Re-add the test entry from Task 7 Step 3 to `_pending-review.md` one more time. Start a **fresh** Claude Code session (not a continuation of this one — a genuinely new `claude` invocation, since `SessionStart` fires on session start). Confirm the new session's context includes the pending-review content (it should be visible as a system reminder / the session should be aware of it without you asking).

Then remove the test entry for real, confirming the file is back to just the `# Pending memory review` header, and start one more fresh session to confirm the hook goes silent again.

- [ ] **Step 6: Commit**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity" && git add automation/memory-dreaming/README.md
git commit -m "docs: memory dreaming README"
```

(The hook script and `~/.claude/settings.json` live outside the repo — nothing to commit for those; note their locations in the README instead, see Task 10.)

---

### Task 10: Write the README

**Files:**
- Create: `automation/memory-dreaming/README.md`

**Interfaces:**
- None — this is documentation only, for future-you or anyone else who finds this folder.

- [ ] **Step 1: Write the README**

```markdown
# Memory Dreaming

Nightly + weekly maintenance routine over the Claude Code memory store. Spec: `docs/superpowers/specs/2026-08-06-memory-dreaming-design.md`. Plan: `docs/superpowers/plans/2026-08-06-memory-dreaming.md`.

## What runs where

- **Nightly scanner** (`run-nightly.ps1`, 2:17am daily) — mechanical auto-fixes to `memory/*.md` + `MEMORY.md`, drafts proposals for anything else into `memory/_pending-review.md`.
- **Monday reviewer** (`run-monday.ps1`, 8:03am Mondays) — read-only. Sends a push notification teaser if `_pending-review.md` has entries. Applies nothing.
- **SessionStart hook** (`C:\Users\info\.claude\hooks\surface-pending-memory-review.py`, registered in the global `~/.claude/settings.json`) — prints the full pending-review list at the start of your next Claude Code session, any project, if there's anything waiting.

## Files outside this repo

- `C:\Users\info\.claude\hooks\surface-pending-memory-review.py` — the SessionStart hook script
- `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-cursor.json` — cursor state
- `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_pending-review.md` — the proposal queue
- `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\_dream-log.md` — audit trail of every auto-applied change
- Two `schtasks` entries: `MemoryDreamingNightly`, `MemoryDreamingMondayReview`

## To review pending proposals

Just start using Claude Code normally — the SessionStart hook surfaces the list automatically if there's anything waiting. Reply in plain language (e.g. "apply 1, 3, skip 2") and ask Claude to edit the relevant memory files, then clear the reviewed entries from `_pending-review.md` and log the outcome in `_dream-log.md`.

## To check the scheduled tasks

```powershell
schtasks /query /tn "MemoryDreamingNightly" /v /fo LIST
schtasks /query /tn "MemoryDreamingMondayReview" /v /fo LIST
```

## To disable

```powershell
schtasks /change /tn "MemoryDreamingNightly" /disable
schtasks /change /tn "MemoryDreamingMondayReview" /disable
```

## To uninstall completely

```powershell
schtasks /delete /tn "MemoryDreamingNightly" /f
schtasks /delete /tn "MemoryDreamingMondayReview" /f
```

Then remove the `SessionStart` block from `C:\Users\info\.claude\settings.json` and delete `C:\Users\info\.claude\hooks\surface-pending-memory-review.py`.

## Cost note

Each nightly/weekly run is a real `claude -p` invocation with its own usage cost — check in after ~2 weeks of real proposals to confirm the signal-to-cost ratio holds (see spec's Cost Note section).
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity" && git add automation/memory-dreaming/README.md
git commit -m "docs: memory dreaming README"
```

---

## Self-Review Notes

- **Spec coverage:** nightly auto-apply boundary (Task 2, already written), proposal format with quotes (Task 2), Monday teaser notification (Task 3/7), SessionStart surfacing (Task 9), `dontAsk` + scoped `--allowedTools` safety (Task 4/5/7), cost note (Task 10 README) — all covered.
- **Placeholder scan:** every code-generation step names the exact DeepSeek prompt and the exact contract to verify against, rather than "add appropriate handling."
- **Type/format consistency:** the `_pending-review.md` numbering format defined in Task 1/2 is the same format Task 3/7's reviewer counts and Task 9's hook regex-matches (`^## \d+\. `) — checked and consistent.
- **Scope:** 10 tasks, each independently testable, matches a single implementation pass. Vault integration is out of scope per the spec's non-goals.
