# OpenCode GLM-5.1 Integration for Antigravity

This extension module turns Antigravity into a multi-agent "Mission Control" environment by bridging the gap between Gemini (which handles high-level planning) and GLM-5.1 acting as an autonomous engineer.

## Features Added

1. **Model Swapping**: Using `/models` dynamically catches terminal or system prompts, allowing quick switching to `glm-5.1` context to bypass quota limits.
2. **Project Awareness**: The `OpenCodeAgent` provides GLM-5.1 with deep hooks into the workspace (`readProjectDirectory`) allowing it to parse, browse, and edit multiple files accurately.
3. **Tool Execution**: Allows passing MCP commands (like Vercel deployments, Web Search, etc.) directly down to GLM-5.1 through the OpenRouter MCP server.
4. **VibeGuard Safety**: Before any file data is sent to the GLM API, `VibeGuard.js` strips out standard SECRETS (OpenRouter API Keys, generic sk- keys, etc.) replacing them with placeholders, returning safety to your operations.

## Architecture Structure
- `agent.js`: The central orchestrator binding GLM requests to MCP and the local FS index.
- `commandHook.js`: Intercepts system prompts starting with `/models`.
- `vibeGuard.js`: The safety tokenizer and untokenizer.

## Usage Guide
In your Antigravity environment, when referencing the OpenCode Extension via natural language or terminal hooks:

```javascript
const OpenCodeAgent = require('./agent');
const agent = new OpenCodeAgent(__dirname);

// To swap models manually via terminal input interception:
agent.promptInstruction("/models glm");

// GLM executes with project awareness and vibeGuard protections:
// (Tokens will be automatically redacted before sending and unredacted on return if modifying files)
agent.promptInstruction("Find the config file and update it with my openrouter key sk-or-v1-abcdef...");
```
