# aloe-signs-website — Claude Code instructions

## Context navigation (Graphify) — 3-layer rule

A knowledge graph of this codebase lives in `graphify-out/` (kept fresh by a post-commit hook). Before exploring raw code:

1. **First:** consult `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json` (`graphify query "<question>"` from this directory) to locate the relevant files/components.
2. **Second:** check the Obsidian vault notes at `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\clients\aloe-signs\` for decisions and gotchas.
3. **Third:** only then open raw source files — and only the ones the graph pointed to.

After doc changes (`.md` files), refresh with `/graphify . --update`. Code changes are handled automatically on commit.

## Project notes

- Deploys automatically on git push to main (Vercel Root Directory = aloe-signs-website). Do not run vercel CLI from this subfolder.
- `jobcards` table schema is owned by the `/api/setup-jobcards` route — add columns there, then re-run it.
- Admin = Andre only; the `admin@` email address belongs to AB, who is a regular user.
