@AGENTS.md

## Context navigation (Graphify) — 3-layer rule

A knowledge graph of this codebase lives in `graphify-out/` (kept fresh by a post-commit hook). Before exploring raw code:

1. **First:** consult `graphify-out/GRAPH_REPORT.md` / `python -m graphify query "<question>"` from this directory to locate the relevant files.
2. **Second:** check the Obsidian vault notes at `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\clients\hslabour\` for decisions and gotchas.
3. **Third:** only then open raw source files — and only the ones the graph pointed to.

## Project notes

- PlacementPartner is the system of record for jobs; /jobs is iframe-default.
- Legal placeholders (reg number, address, Information Officer) are still TODO.
- Insights generator (AI articles) needs migration 0006 + Vercel env keys to go live.
