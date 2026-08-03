---
name: Design Self-Audit
description: Pre-launch (and retroactive) design scoring rubric for client site builds — grades the build against itself before calling it done
---

# Design Self-Audit

A global rule across this and all other client-site projects: before calling any site build "done" — and when asked to review a site that's already shipped — grade it against this rubric, fix what scores low, then re-run the audit.

**When to use this skill**: after a build reaches feature-complete/hero-through-footer state, before deploy; or any time the user asks "how does this site look" / "review this site's design" / "audit this build" for an existing client site.

## The 7 categories

Score each 0–100 and list concrete, file-specific issues (not vague impressions):

1. **Visual hierarchy** — is the eye guided to the right thing first (CTA, headline, hero image)? Are heading levels and font-weight/size steps consistent and purposeful?
2. **Typography** — is there a real pairing (not default sans-serif everywhere), consistent scale, sensible line-length/line-height?
3. **Color & imagery** — does the palette read as intentional (not the generic purple-gradient/Inter-font/rounded-card AI-slop look)? Are images real/high-quality and on-brand, not stock-obvious filler?
4. **Motion & interaction** — is animation used in rhythm (alternating static/animated sections), not everywhere (exhausting) or nowhere (flat)? Do hover/scroll interactions feel deliberate?
5. **Design-system consistency** — do spacing, radii, shadows, and component styles repeat the same tokens across pages, or drift section to section?
6. **Performance & responsiveness** — check actual DevTools device emulation (phone + tablet) for layout breaks, and flag anything not raising the odds of solid Lighthouse scores (unoptimized media, layout shift, oversized assets).
7. **Trust & conversion** — does the page make the visitor believe this is a real, credible business (contact info, social proof, clear next action), and is there one obvious primary CTA per section rather than competing asks?

## Process

1. Score all 7 categories 0–100 with 2-3 concrete issues per category that scores below 80.
2. Fix the issues.
3. Re-run the audit. Ship when every category is ≥80; treat anything under 50 as a blocking defect, not a nitpick.
4. When auditing a site you didn't just build (a retroactive pass), skim the live pages/DevTools yourself before scoring — don't score from memory of the codebase alone.
