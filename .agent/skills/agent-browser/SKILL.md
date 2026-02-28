---
description: Use Vercel Agent Browser for fast web automation and visual testing instead of playwright or puppeteer unless needed.
---

# Agent Browser Skill

Use `agent-browser` for fast, native web automation, taking DOM snapshots, and directly interacting with pages. This tool runs directly via a compiled Rust binary, making it generally faster and more AI-friendly than other solutions.

## Setup
It should already be installed globally.
If not, install it: `npm install -g agent-browser` and `agent-browser install`.

## Core Commands
1. **Open a page:** `agent-browser open <url>`
2. **Snapshot the DOM:** `agent-browser snapshot -i` (Gets interactive elements with refs like `@e1`, `@e2`)
3. **Interact:** `agent-browser click @e1` or `agent-browser fill @e2 "text"`
4. **Re-snapshot:** Always run `agent-browser snapshot -i` after a page changes to get the updated refs.
5. **Get text:** `agent-browser get text @e1`
6. **Wait for network:** `agent-browser wait --load networkidle` (Useful for waiting for slow pages to load before taking a snapshot)
7. **Take screenshot:** `agent-browser screenshot page.png`

Run `agent-browser --help` for the full command list if you need more advanced capabilities like semantic finding (`agent-browser find role button click --name Submit`).
