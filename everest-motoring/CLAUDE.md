# everest-motoring — Claude Code instructions

## Context navigation (Graphify) — 3-layer rule

A knowledge graph of this codebase lives in `graphify-out/` (kept fresh by a post-commit hook). Before exploring raw code:

1. **First:** consult `graphify-out/GRAPH_REPORT.md` / `python -m graphify query "<question>"` from this directory to locate the relevant files.
2. **Second:** check the Obsidian vault notes at `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\clients\everest\` for decisions and gotchas.
3. **Third:** only then open raw source files — and only the ones the graph pointed to.

## Project notes

- Off-inventory sales flow (/admin/sales): migration 20260706 must be applied by hand or sale-video polling breaks.
- Monthly PDF report: GA/Meta tokens have gotchas (Testing-mode 7-day expiry; Meta post-reach deprecated 2026-06-15) — see vault note project_everest_report.
- Admin car flyer (Satori/next-og): Node-runtime font loading, CFF fonts OK, gap:undefined crashes, en-ZA nbsp number tofu — see vault note reference_everest_flyer_og.
