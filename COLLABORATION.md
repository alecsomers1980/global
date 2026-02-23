# Collaboration Guide

Standard procedures for collaborating on the Antigravity workspace.

## 1. Multi-Laptop Synchronisation (Git)
We use Git as the "Source of Truth". To ensure both laptops stay in sync:
- **Always Pull First**: Run `git pull` at the start of every session.
- **Commit Often**: Break your work into small, descriptive commits.
- **Branch Strategy**: Use feature branches (e.g., `git checkout -b feature/new-contact-form`) to avoid editing the same code simultaneously.
- **Conflict Resolution**: If you both edit the same file, use Cursor's "Merge Conflict" helper to choose the best version.

## 2. Setup & Tools
- **Cursor / VS Code**: Recommended for AI-assisted development.
- **Live Share**: For real-time pair programming, use the **VS Code Live Share** extension. One user can "host" and send a link to the other, allowing both to see and edit the same code live.
- **Stitch MCP Server**: Essential for UI generation. Ensure your `mcp_config.json` is updated with your personal Stitch credentials.

## 2. Using AI Skills
Our AI skills are located in `[/.agent/skills](file:///c:/Users/info/OneDrive/Documents/Antigravity/.agent/skills)`.
- **`design-md`**: Use this to generate or update `DESIGN.md` for any project.
- **`react-components`**: Standard tool for converting Stitch designs to code.
- **`stitch-loop`**: Use this for iterative UI-driven development.

> [!IMPORTANT]
> When creating new skills, always document them in a `SKILL.md` file within the skill's subdirectory.

## 3. Workflows
Standard workflows are in `[/.agent/workflows](file:///c:/Users/info/OneDrive/Documents/Antigravity/.agent/workflows)`.
- Use `/new-client-site` to initialize a new project folder.
- Use `/deploy` for Vercel production deployments.

## 4. Secrets & Environment Variables
> [!CAUTION]
> NEVER commit sensitive information (like Stitch API keys or Vercel tokens) to Git.

- Each laptop must have its own `.env.local` file in the project directory (e.g., `rvrinc/.env.local`).
- Copy the `.env.example` (if available) to get started.
- Share keys via a secure channel (like an office password manager), NOT via the code repository.
- **Styling**: Vanilla CSS is preferred unless Tailwind is explicitly requested.
- **Naming**: Use kebab-case for files and folders.
- **Icons**: Use Lucide-react for consistency.

## 5. Communication
- Document all major changes in the project's root `DESIGN.md`.
- Use the `PROJECT_DEBRIEF` workflow when finishing a milestone.
