---
name: mission-control
description: GLOBAL CRITICAL RULE — Token-saving protocol. Delegate all code generation to GLM-5.1 via OpenRouter MCP. Applies to EVERY project.
---

# Mission Control Protocol: Multi-Agent Orchestration

This skill defines the behavioral rules, boundaries, and communication loops for the Antigravity multi-agent environment. It applies **globally across all projects and conversations**.

## The Golden Rule

> **Claude/Gemini is the Architect. GLM-5.1 is the Engineer.**
> Every time you need to generate, modify, or create code — you MUST delegate the code generation to GLM-5.1 via `mcp_openrouter_chat_completion`. You handle only planning, file I/O, and verification.

## Roles & Responsibilities

### Claude / Gemini (The Architect)
- **DO:** Read files, analyze architecture, plan implementation, craft precise prompts for GLM
- **DO:** Write GLM's output to disk using `write_to_file` / `replace_file_content`
- **DO:** Run terminal commands (builds, deploys, scripts)
- **DO:** Verify results (browser checks, error reviews)
- **DO NOT:** Generate application code yourself. Every block of code you write costs premium tokens.

### GLM-5.1 (The Engineer)
- Accessed via `mcp_openrouter_chat_completion` with model `z-ai/glm-5.1`
- Generates all application code: React components, pages, scripts, CSS, API routes
- Runs on the user's OpenRouter API key at a fraction of the cost

## The Execution Loop

When a coding task is required, follow this exact sequence:

### Step 1: Context Gathering (Architect)
- Read the relevant files to understand current state
- Identify what needs to change and where

### Step 2: Craft the Prompt (Architect)
- Write a detailed, self-contained prompt for GLM that includes:
  - The exact file path and purpose
  - Relevant existing code or imports that must be preserved
  - Specific requirements (features, styling, data sources)
  - Framework/library constraints (e.g., "Next.js App Router", "PocketBase", "shadcn/ui")
- Keep the prompt precise — every token in the prompt costs money too

### Step 3: Delegate to GLM (via MCP)
```
mcp_openrouter_chat_completion({
  model: "z-ai/glm-5.1",
  messages: [
    { role: "system", content: "You are a senior full-stack developer..." },
    { role: "user", content: "<your detailed coding prompt>" }
  ],
  max_tokens: 4096
})
```

### Step 4: Write to Disk (Architect)
- Take GLM's response and write it directly to the target file
- Use `write_to_file` for new files, `replace_file_content` for edits

### Step 5: Verify (Architect)
- Check for build errors, render the page, or run tests
- If GLM's output has issues, send a follow-up correction prompt to GLM (not fix it yourself)

## When to Skip GLM

You may write code directly ONLY when:
- The change is trivially small (< 5 lines): a single import, a one-line fix, a config tweak
- It's a terminal command or script execution (not code generation)
- It's updating a markdown artifact or documentation
- GLM is unavailable or returning errors after 2 retries

## VibeGuard Safety Controls

**CRITICAL:** Never pass raw API keys or credentials in prompts to GLM. Describe them structurally (e.g., "use the environment variable `NEXT_PUBLIC_POCKETBASE_URL`").

## Verification Loop

After writing GLM's code to disk:
1. Check for compilation/build errors
2. Visually verify UI changes if applicable
3. If regressions occur, craft a correction prompt for GLM — do NOT fix the code yourself
4. Once successful, summarize in `walkthrough.md`
