# wendy-lane — Claude Code instructions

## Context navigation (Graphify) — 3-layer rule

A knowledge graph of this codebase lives in `graphify-out/` (kept fresh by a post-commit hook). Before exploring raw code:

1. **First:** consult `graphify-out/GRAPH_REPORT.md` / `python -m graphify query "<question>"` from this directory to locate the relevant files.
2. **Second:** check the Obsidian vault notes at `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\clients\wendy-lane\` for decisions and gotchas.
3. **Third:** only then open raw source files — and only the ones the graph pointed to.

## Project notes

- The real-price quote calculator is the site's differentiator; prices came from source PDFs with no text layer (PyMuPDF, not OCR).
- Brand green: #0E7C0F.
