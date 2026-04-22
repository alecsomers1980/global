---
description: Synchronize all AI skills, workflows, brain artifacts, and code across laptops.
---
# Workspace Sync Protocol

When the user runs `/sync`, execute the following steps exactly as written:

1. **Pull Latest Changes**
// turbo
Run `git pull --rebase` in the workspace root to ensure this laptop has the latest AI skills, workflows, design files, and shared brain context.

2. **Verify Shared MCP Servers**
Read `.agent/shared_mcp_config.json`. Compare its contents to the required servers (like Stitch) the user needs. If the user's local configuration is missing a server, instruct the user on how to add it.

3. **Stage Agent Artifacts**
If you (the agent) have generated any local artifacts (like task.md, implementation_plan.md, walkthrough.md) that hold long-term value, copy them into `.agent/brain/` so they are tracked by version control.

4. **Commit and Push**
// turbo
Run `git add .agent/ HANDOVER.md README.md VISIBILITY_CHECKLIST.md` and any other modified project files.
// turbo
Run `git commit -m "chore: workspace sync [skills, workflows, brain]"`
// turbo
Run `git push`

5. **Notify User**
Confirm that the sync is complete and that the other laptop can now run `git pull` or `/sync` to receive the updates.
