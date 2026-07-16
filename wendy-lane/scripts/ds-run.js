#!/usr/bin/env node
/**
 * Reads a prompt from a file and sends it to DeepSeek via ds-agent.js, writing the
 * raw response to an output file. Keeps long specs out of shell-argument quoting.
 *
 * Usage: node scripts/ds-run.js <prompt-file> <output-file>
 */
const fs = require('fs');
const path = require('path');

const AGENT = path.resolve(__dirname, '../../opencode-glm-extension/ds-agent.js');
const { callDeepSeek } = require(AGENT);

const [promptFile, outFile] = process.argv.slice(2);
if (!promptFile || !outFile) {
  console.error('Usage: node scripts/ds-run.js <prompt-file> <output-file>');
  process.exit(1);
}

(async () => {
  const prompt = fs.readFileSync(promptFile, 'utf8');
  console.log(`[ds-run] Sending ${prompt.length} chars to DeepSeek...`);
  const started = Date.now();
  try {
    const { text, usage, stop_reason } = await callDeepSeek(prompt);
    fs.writeFileSync(outFile, text, 'utf8');
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[ds-run] Wrote ${text.length} chars to ${outFile} in ${secs}s`);
    if (usage) console.log(`[ds-run] usage input=${usage.input_tokens} output=${usage.output_tokens} stop=${stop_reason}`);
    if (stop_reason === 'max_tokens') console.warn('[ds-run] WARNING: hit max_tokens, output is truncated');
  } catch (e) {
    console.error(`[ds-run] FAILED: ${e.message}`);
    process.exit(1);
  }
})();
