/**
 * OpenCode GLM-5.1 Agent Orchestrator
 * Integrates GLM 5.1 with project awareness and MCP context in Antigravity.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const VibeGuard = require('./vibeGuard');
const ModelSwapper = require('./commandHook');

// Configuration - Loading OpenRouter key from Antigravity standard location
const CONFIG_PATH = path.join(process.env.USERPROFILE || process.env.HOME || '.', '.gemini/antigravity/mcp_config.json');
let OPENROUTER_API_KEY = "";

try {
  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    OPENROUTER_API_KEY = config.mcpServers.openrouter.env.OPENROUTER_API_KEY;
  } else {
    throw new Error(`Config not found at ${CONFIG_PATH}`);
  }
} catch (e) {
  console.warn(`[OpenCodeAgent] ${e.message}. Ensure keys are set correctly.`);
}

class OpenCodeAgent {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.swapper = new ModelSwapper();
    this.activeModel = "z-ai/glm-5.1"; // Defaulting to GLM 5.1 as requested
  }

  /**
   * Calls the OpenRouter API to get a response from GLM-5.1
   */
  async callLLM(prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: this.activeModel,
        messages: [{ role: "user", content: prompt }]
      });

      const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://antigravity-mission-control.local', // Required by OpenRouter
          'X-Title': 'Antigravity Mission Control'
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (d) => responseBody += d);
        res.on('end', () => {
          try {
            const json = JSON.parse(responseBody);
            if (json.error) {
               reject(new Error(json.error.message || "Unknown OpenRouter Error"));
            } else {
               resolve(json.choices[0].message.content);
            }
          } catch (e) {
            reject(new Error("Failed to parse OpenRouter response"));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(data);
      req.end();
    });
  }

  /**
   * Main entry for sending instructions to GLM.
   */
  async promptInstruction(instruction) {
    console.log(`\n[Mission Control] Task Received: ${instruction}`);
    
    // 1. Safety Filter (VibeGuard)
    const safeInstruction = VibeGuard.mask(instruction);
    
    // 2. Swapper Hook check
    if (this.swapper.processCommand(instruction)) {
      return { msg: "Context updated." };
    }

    try {
      // 3. Live Execution
      console.log(`[Engineer] Thinking (Model: ${this.activeModel})...`);
      const response = await this.callLLM(safeInstruction);
      
      // 4. Unmask results (if needed for file generation)
      const finalResponse = VibeGuard.unmask(response);
      
      console.log(`[Engineer] Response: ${finalResponse}\n`);
      return {
        agent: "GLM-5.1",
        response: finalResponse
      };
    } catch (err) {
      console.error(`[Error] Integration Failed: ${err.message}`);
      return { error: err.message };
    }
  }
}

// Simple CLI capability
if (require.main === module) {
  const agent = new OpenCodeAgent();
  const args = process.argv.slice(2);
  if (args.length > 0) {
    agent.promptInstruction(args.join(" "));
  } else {
    console.log("Usage: node agent.js \"your instruction here\"");
  }
}

module.exports = OpenCodeAgent;
