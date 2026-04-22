---
name: Form and Action Behaviors
description: Global rule for how buttons and actions should behave across all projects
---

# UI Actions and Form Submissions

As a global rule across this and all other projects, follow these strict guidelines when implementing any form submissions, button clicks, or user actions:

1. **No Unintended Reloads**: Never allow the page to reload during a form submission or button click unless explicitly requested. Always use `e.preventDefault()`, controlled React state, or Next.js `useActionState`/`useFormStatus` to handle submissions client-side.
2. **In-page Feedback**: Always display inline success or error messages (e.g., toast notifications, or inline text like "Failed to submit" or "Success!") directly on the current page.
3. **Graceful Failures**: If an action fails, the user must stay on the exact same page, without losing their input data, and see a clear error message explaining what failed.
4. **Loading States**: Disable buttons and show an explicit loading state (e.g., spinner or "Processing...") while an action is taking place so the user knows their click was registered.

**When to use this skill**:
Apply this skill whenever you are creating, refactoring, or reviewing forms, submit buttons, or any actionable UI elements that mutate data or trigger backend processes.
