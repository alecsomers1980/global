---
name: Design Self-Audit
description: Pre-launch (and retroactive) design scoring rubric for client site builds — grades the build against itself before calling it done
---

# Design Self-Audit

A global rule across this and all other client-site projects: before calling any site build "done" — and when asked to review a site that's already shipped — grade it against this rubric, fix what scores low, then re-run the audit.

**When to use this skill**: after a build reaches feature-complete/hero-through-footer state, before deploy; or any time the user asks "how does this site look" / "review this site's design" / "audit this build" for an existing client site.

## Pre-build (new client sites only): outlier research

Before designing anything for a *new* client build, pull the 5 best and 5 worst-performing sites in the client's niche and extract what the winners share — this is what the market already expects to see, not a design opinion, and it's the conversion-side complement to the positioning pass (who/what/why-better) that happens before this.

1. Use Firecrawl (already installed as an MCP) to pull the top ~5 and bottom ~5 sites for the client's niche.
2. Extract the pattern the winners share specifically — what's above the fold, what proof they show, section order — not a vague "good design" impression.
3. Feed the pattern list into the build brief alongside the positioning statement, so both are settled before the first screen is drawn.
4. Skip this step entirely for a retroactive audit of an already-shipped site — it only applies to new builds.

(Adopted 2026-08-09 from the learning digest — Jack Roberts. Concrete example: every high-performing Texas roofer site shows a roof above the fold, real photos of people, and video testimonials — table stakes for that niche, discoverable this way rather than guessed at.)

## The 7 categories

Score each 0–100 and list concrete, file-specific issues (not vague impressions):

1. **Visual hierarchy** — is the eye guided to the right thing first (CTA, headline, hero image)? Are heading levels and font-weight/size steps consistent and purposeful?
2. **Typography** — is there a real pairing (not default sans-serif everywhere), consistent scale, sensible line-length/line-height?
3. **Color & imagery** — does the palette read as intentional (not the generic purple-gradient/Inter-font/rounded-card AI-slop look)? Are images real/high-quality and on-brand, not stock-obvious filler?
4. **Motion & interaction** — is animation used in rhythm (alternating static/animated sections), not everywhere (exhausting) or nowhere (flat)? Do hover/scroll interactions feel deliberate?
5. **Design-system consistency** — do spacing, radii, shadows, and component styles repeat the same tokens across pages, or drift section to section?
6. **Performance & responsiveness** — check actual DevTools device emulation (phone + tablet) for layout breaks, and flag anything not raising the odds of solid Lighthouse scores (unoptimized media, layout shift, oversized assets).
7. **Trust & conversion** — does the page make the visitor believe this is a real, credible business (contact info, social proof, clear next action), and is there one obvious primary CTA per section rather than competing asks? Grade these specifically:
   - **The fold carries the weight** — headline first, hero image second. Most visitors never scroll and judge in ~0.5s, so score the above-the-fold view on its own before looking at anything below it.
   - **The offer reads through all four parts** — dream outcome (what they want, never the product itself) × perceived likelihood of achieving it (specific proof: reviews, case studies, a real guarantee — not vague badges) × time-to-value × effort/sacrifice required.
   - **Proof sits at the CTA** — doubt spikes at the button, so trust signals belong next to it, not quarantined in a testimonials section further down.
   - **You're selling against inaction, not competitors** — does the page give a reason to act *now*?
   - **Real, slightly-imperfect photography beats polished stock/AI** — AI has flooded the web with perfect-and-soulless imagery, so visible imperfection now reads as a trust signal.

   (Conversion items added 2026-08-08 from the learning digest — Hormozi via Sam Crawford. Deliberately *not* adopted: "one split test a week" — client sites don't have the traffic for a statistically valid A/B test.)

## Process

1. Score all 7 categories 0–100 with 2-3 concrete issues per category that scores below 80.
2. Fix the issues.
3. Re-run the audit. Ship when every category is ≥80; treat anything under 50 as a blocking defect, not a nitpick.
4. When auditing a site you didn't just build (a retroactive pass), skim the live pages/DevTools yourself before scoring — don't score from memory of the codebase alone.

## Gotchas

Concrete tells folded in from the learning digest (2026-08-09) — check for these specifically rather than eyeballing for "looks generic."

- **Four visual AI tells** (category 3): wide letter-spacing, a light-colour gradient background, "that" particular AI green, gradient-filled cards. Any of these on a hero section is worth a second look.
- **AI builders add strokes/borders around sections by default.** Strip them — bordered boxes read as scaffolding, not intentional design (category 5).
- **One viewport, one thought.** Each fold-height section should carry a single idea, not compete with itself (category 1).
- **H1 ≤ 7 words.** Longer headlines lose the ~0.5s judgment window (category 7, fold discipline).
- **Text density is the single most common fault** across real site reviews. If a section reads as a wall of text, it fails category 1 regardless of what the copy says.
- **Scroll-scrubbed hero video: use a JPEG frame sequence, not an MP4.** Scrubbing an MP4 against scroll position stutters on many devices; a frame sequence doesn't (category 6).
- **"Built with platforms you love" credibility strip** — for a new site with no logos or testimonials yet, a strip of the tools/platforms used is an honest, immediately-usable substitute for social proof (category 7).
- **Constrain with a reference image or the outlier-research findings above, not a shared "taste pack" skill.** Style skills used across many builds converge on their own tropes over time — a specific inspiration image doesn't.
