---
description: Initialize a new client website with built-in agency standards
---
# New Client Site Workflow

This workflow initializes a new client website following our agency standards for SEO, performance, and UX.

## 0. Project Kickoff & Discovery
Before writing any code, the AI must ask the user clarifying questions to fully understand the project requirements. Example questions include:
- What is the client's industry and target audience?
- What is the primary goal of the website (e.g., lead generation, e-commerce, portfolio)?
- Are there any specific competitor websites or design inspirations we should look at?
- What are the must-have features or integrations (e.g., CRM, booking system)?

**Agent Proactivity**: During this phase, the AI must also suggest improvements or point out things the user might have missed (e.g., suggesting an exit-intent popup for lead gen, or a specific schema markup for local SEO).

## 0.5 Research & Inspiration
If the user provides competitor websites or if the AI needs to understand the industry better, the AI should use the `search_web` or `read_url_content` tools to analyze current trends, layouts, and best practices for the specified niche before proceeding.

## 1. Project Setup
When starting a new project, follow these standards:
- **Framework**: Use modern web standards (React/Vite/Next.js) or Vanilla HTML/JS as appropriate for the project size.
- **Styling**: Vanilla CSS for maximum flexibility and performance, following a premium, modern aesthetic (unless Tailwind is explicitly requested).
- **Architecture**: Modular, component-driven design.

## 2. Agency Standards & Constraints
Please enforce the following rules throughout the build:
- **Prompt Engineering**: When generating UI designs or system architectures, the AI must *rewrite* the prompt to optimize for quality, structure, and constraints. **The AI must show this rewritten prompt to the client for approval BEFORE implementing.**
- **Design Options**: **ALWAYS provide the client with 3 distinct design options** (using Stitch or mockups) to choose from before committing to code. This ensures they have a voice in the creative direction.
- **Security & Data Safety**: Security is paramount. All functions (Authentication, File Uploads, User Data) must be secure without compromising site speed or performance.
- **Automated Backups**: Ensure backup plans are considered and configured to run automatically (weekly, or as usage volume requires).
- **Performance First**: All pages must be built with performance in mind: prioritizing speed, cross-browser compatibility, and mobile-friendliness.
  - **Image Optimization**: All images must be explicitly optimized for dimensions and file size. Use Next.js `<Image>` components for automatic WebP/AVIF generation, lazy-loading, and responsive sizing. Never use raw `<img>` tags unless strictly unavoidable.
- **SEO & AI Searchability**: 
  - Content and structure must be optimized not just for Google/traditional search engines, but explicitly for **AI Searchability** (e.g., ChatGPT, Perplexity, Gemini). 
  - Ensure semantic HTML5 tags (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`).
  - Use structured data, clear informational hierarchy, and direct answers to common queries so AI bots can easily index and digest what the site/system offers.
  - Add proper Meta Tags (Title, Description) and a single `<h1>` per page.
  - Implement Local Schema Markup for businesses.
- **UX & Design**: 
  - Professional, conversion-focused design.
  - Always include a clear Call to Action (CTA) above the fold.
  - Ensure contrast ratios meet accessibility standards.

## 3. Scaffolding
- Check the `Component-Library` for reusable components (Heroes, CTAs, Footers) before building from scratch.
- Ensure the admin or client hand-off experience is clean and intuitive.
