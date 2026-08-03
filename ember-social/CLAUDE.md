# ember-social — Claude Code instructions

## Context navigation (Graphify) — 3-layer rule

A knowledge graph of this codebase lives in `graphify-out/` (kept fresh by a post-commit hook). Before exploring raw code:

1. **First:** consult `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json` (`graphify query "<question>"` from this directory) to locate the relevant files/components.
2. **Second:** check the Obsidian vault notes at `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\business\ember-social\` for decisions and gotchas.
3. **Third:** only then open raw source files — and only the ones the graph pointed to.

After doc changes (`.md` files), refresh with `/graphify . --update`. Code changes are handled automatically on commit.

## Project notes

- No GitHub auto-deploy: deploy manually with vercel CLI from the Antigravity repo root (Vercel rootDirectory = ember-social).
- Migration 20260706 (off-inventory sales) must be applied by hand or sale-video polling breaks.
