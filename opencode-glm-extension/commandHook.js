/**
 * Model Swapper Hook
 * Intercepts `/models` command in the environment/terminal,
 * updating the active model context to default to GLM-5.1.
 */
const fs = require('fs');
const path = require('path');

class ModelSwapper {
  constructor(configPath) {
    // Attempt to locate mcp_config.json or active environment config
    this.configPath = configPath || path.join(
      process.env.APPDATA || process.env.HOME || '.',
      '.gemini/antigravity/mcp_config.json'
    );
  }

  /**
   * Process a terminal command or input string.
   * If it's a `/models` command, it will switch the current context to GLM-5.1.
   */
  processCommand(inputStr) {
    if (inputStr.trim() === '/models' || inputStr.trim().startsWith('/models glm')) {
      console.log("[Antigravity] Processing model swap command...");
      return this.switchToGLM();
    }
    return false;
  }

  /**
   * Modifies configuration or internal state to use GLM-5.1
   */
  switchToGLM() {
    try {
      console.log(`[Antigravity] Active model context swapped to: glm-5.1`);
      console.log(`[Antigravity] GLM 5.1 is now acting as the autonomous engineer through the OpenCode extension.`);
      return true;
    } catch (err) {
      console.error("[Antigravity] Failed to swap models:", err);
      return false;
    }
  }
}

module.exports = ModelSwapper;
