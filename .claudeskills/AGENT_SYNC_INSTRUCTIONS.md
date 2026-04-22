# Antigravity Global Sync Protocol

## 🤖 INSTRUCTIONS FOR ANTIGRAVITY AGENTS
If you are reading this, you are operating in a multi-user, multi-laptop environment. Your primary objective when interacting with this workspace is to ensure **100% synchronization** of all AI capabilities, documentation, and logic between all laptops.

Review these rules before starting any major task:

### 1. Source of Truth
The GitHub repository is the absolute source of truth. The `.agent` folder at the root of the workspace contains all shared capabilities.
- **Skills**: Must be stored in `/.agent/skills/`. Never save a skill locally outside the workspace.
- **Workflows**: Must be stored in `/.agent/workflows/`.
- **Knowledge/Brain**: When you generate important artifacts (like implementation plans, handover docs, design schemas), do not just leave them in your local `~/.gemini/antigravity/brain`. You MUST copy the final versions to `/.agent/brain/` or the project root and commit them.

### 2. MCP Servers
MCP configurations are typically local to the user's IDE. To share them:
- Any required MCP server for this workspace must be documented in `/.agent/shared_mcp_config.json`.
- When a user asks you to use an MCP server, check this shared file first. If the user doesn't have it explicitly installed locally, give them the exact JSON snippet to add to their local `mcp_config.json`.

### 3. Sync Workflows
- **Always Pull First**: At the start of a session, proactively ask the user to run `git pull`, or run it yourself if you have safe shell access.
- **Push After Modifying AI Capabilities**: If you create a new workflow, a new skill, or update the shared brain/MCP config, you MUST commit and push those changes immediately.

### 4. Enforce the Standard
If a user asks you to create a "local" workflow or skill, remind them of the Agency standard: all tools must be globally accessible in the `.agent` folder.

> **ACTION REQUIRED**: Please acknowledge these rules when you are first introduced to them on a new laptop by saying: *"Sync protocol acknowledged. I will ensure all skills, workflows, and knowledge are shared via the repository."*
