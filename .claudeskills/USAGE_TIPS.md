# AI Usage Optimization Guide

Mastering your usage quotas allows you to work faster and more efficiently with your AI Agent. Follow these guidelines to maximize your **Gemini 1.5 Pro** limits and work "smarter" in this workspace.

---

## 🚀 1. The "Pro vs. Flash" Strategy
*   **Gemini 1.5 Pro**: Reserved for "Heavy Lifting" (Architecture, complex multi-file debugging, new feature generation).
*   **Gemini 1.5 Flash**: Use for "Light Lifting" (Quick questions, unit tests, simple styling edits, documentation).
*   **Tip**: Switch models in the UI to save your Pro quota for when it really matters.

## 🎯 2. Precision Scoping
*   **Avoid Vague requests**: "Fix the site" or "Check my code" forces the agent to read the entire workspace.
*   **Be Specific**: "Read `src/app/portal/page.js` and fix the progress bar logic."
*   **Why?** Reading fewer files scales your "Tokens Per Minute" (TPM) further.

## 🧠 3. Trust the Artifacts
*   **Plan First**: Review `implementation_plan.md` carefully. It is much cheaper to fix a design mistake in a markdown file than to redo 500 lines of generated code.
*   **Task Tracking**: Keep `task.md` updated so the agent always knows exactly where it left off without re-analyzing everything.

## 🖼️ 4. Visual Context
*   **Use Images**: Drag screenshots of UI bugs or design inspirations into the chat.
*   **Why?** Vision tokens are extremely efficient and replace paragraphs of descriptive text that burn through text quotas.

## 📦 5. Batching Requests
*   **Consolidate**: Instead of 5 separate messages for small CSS changes, group them into one.
*   **Example**: "Update the header: Logo to 40px, Background to Navy, Login button to Gold."
*   **Why?** Every message requires the agent to reload the conversation "context". Batching reduces this overhead.

## 🔄 6. The "Sync & Save" Rule
*   **Workflow**: Use the **`/sync`** command before switching laptops.
*   **Why?** This stores the AI's "Brain" (task lists and plans) in the repo. If the agent doesn't have to guess what happened on a different machine, it won't waste tokens re-discovering the current state.

## 📖 7. Explicit "Read" Commands
*   If you know a specific file is relevant, tell the agent to read it directly: *"Read `src/utils/supabase/server.js`."* 
*   This is faster and more efficient than letting the agent search for it.

---

> [!TIP]
> **Check your limit**: You can see your real-time Rate Limits (RPM/TPM) and daily resets at **[aistudio.google.com/app/plan](https://aistudio.google.com/app/plan)**.
