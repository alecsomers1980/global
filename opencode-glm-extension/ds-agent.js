/**
 * DeepSeek Agent Orchestrator
 * Routes code-gen prompts to DeepSeek v4 via the local free-claude-code proxy
 * (localhost:8082, Anthropic-compatible). Mirrors agent.js so Claude can call
 * either GLM or DeepSeek with the same invocation shape.
 */
const http = require('http');
const VibeGuard = require('./vibeGuard');

const PROXY_HOST = process.env.DS_PROXY_HOST || 'localhost';
const PROXY_PORT = parseInt(process.env.DS_PROXY_PORT || '8082', 10);
const PROXY_KEY = process.env.DS_PROXY_KEY || 'freecc';
const MODEL = process.env.DS_MODEL || 'claude-opus-4-7';
const MAX_TOKENS = parseInt(process.env.DS_MAX_TOKENS || '8192', 10);

function parseSSE(buf) {
  let text = '';
  let usage = null;
  let stop_reason = null;
  const lines = buf.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    let evt;
    try { evt = JSON.parse(payload); } catch { continue; }
    if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
      text += evt.delta.text || '';
    } else if (evt.type === 'message_delta') {
      if (evt.delta?.stop_reason) stop_reason = evt.delta.stop_reason;
      if (evt.usage) usage = { ...(usage || {}), ...evt.usage };
    } else if (evt.type === 'message_start' && evt.message?.usage) {
      usage = { ...(usage || {}), ...evt.message.usage };
    }
  }
  return { text, usage, stop_reason };
}

function callDeepSeek(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    });

    const req = http.request(
      {
        hostname: PROXY_HOST,
        port: PROXY_PORT,
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PROXY_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (d) => (buf += d));
        res.on('end', () => {
          if (buf.startsWith('event:') || buf.includes('\ndata:')) {
            try {
              const { text, usage, stop_reason } = parseSSE(buf);
              if (!text) return reject(new Error(`Empty SSE response. Body: ${buf.slice(0, 500)}`));
              return resolve({ text, usage, stop_reason });
            } catch (e) {
              return reject(new Error(`SSE parse failed: ${e.message}\nBody: ${buf.slice(0, 500)}`));
            }
          }
          try {
            const json = JSON.parse(buf);
            if (json.error) return reject(new Error(json.error.message || 'DeepSeek proxy error'));
            const text = (json.content || [])
              .filter((b) => b.type === 'text')
              .map((b) => b.text)
              .join('\n');
            resolve({ text, usage: json.usage, stop_reason: json.stop_reason });
          } catch (e) {
            reject(new Error(`Failed to parse proxy response: ${e.message}\nBody: ${buf.slice(0, 500)}`));
          }
        });
      }
    );

    req.on('error', (e) => reject(new Error(`Proxy connection failed: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

async function promptInstruction(instruction) {
  console.log(`\n[Mission Control] DeepSeek task: ${instruction.slice(0, 120)}${instruction.length > 120 ? '...' : ''}`);
  const safe = VibeGuard.mask(instruction);
  try {
    console.log(`[Engineer] Thinking (Model: ${MODEL} via ${PROXY_HOST}:${PROXY_PORT})...`);
    const { text, usage, stop_reason } = await callDeepSeek(safe);
    const final = VibeGuard.unmask(text);
    console.log(`\n[Engineer] Response:\n${final}\n`);
    if (usage) console.log(`[usage] input=${usage.input_tokens} output=${usage.output_tokens} stop=${stop_reason}`);
    return { agent: 'DeepSeek-v4', response: final };
  } catch (err) {
    console.error(`[Error] ${err.message}`);
    process.exitCode = 1;
    return { error: err.message };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node ds-agent.js "your instruction here"');
    process.exit(1);
  }
  promptInstruction(args.join(' '));
}

module.exports = { promptInstruction, callDeepSeek };
