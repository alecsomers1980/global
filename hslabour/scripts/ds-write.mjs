/**
 * ds-write.mjs — generate one file with DeepSeek (via the free-claude-code proxy) and write it.
 *
 * Usage:
 *   node scripts/ds-write.mjs <targetRelPath> "<per-file instruction>"
 *
 * Prepends JOBS_BUILD_SPEC.md (the architecture contract) to every prompt, tells DeepSeek to
 * emit ONLY raw file content, strips code fences, and writes the result to <targetRelPath>.
 * The generated code never passes back through the orchestrating model — that's the point.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const HOST = process.env.DS_PROXY_HOST || 'localhost';
const PORT = process.env.DS_PROXY_PORT || '8082';
const KEY = process.env.DS_PROXY_KEY || 'freecc';
const MODEL = process.env.DS_MODEL || 'claude-opus-4-7';
const MAX_TOKENS = parseInt(process.env.DS_MAX_TOKENS || '8192', 10);
const SPEC_FILE = process.env.DS_SPEC || 'JOBS_BUILD_SPEC.md';

function stripFences(text) {
  let t = text.trim();
  const fence = /^```[a-zA-Z0-9]*\n([\s\S]*?)\n```$/;
  const m = t.match(fence);
  if (m) return m[1];
  t = t.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
  return t;
}

function parseSSE(buf) {
  let text = '';
  let usage = null;
  let stop = null;
  for (const line of buf.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    let evt;
    try { evt = JSON.parse(payload); } catch { continue; }
    if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
      text += evt.delta.text || '';
    } else if (evt.type === 'message_delta') {
      if (evt.delta?.stop_reason) stop = evt.delta.stop_reason;
      if (evt.usage) usage = { ...(usage || {}), ...evt.usage };
    } else if (evt.type === 'message_start' && evt.message?.usage) {
      usage = { ...(usage || {}), ...evt.message.usage };
    }
  }
  return { text, usage, stop };
}

async function callDeepSeek(prompt) {
  const res = await fetch(`http://${HOST}:${PORT}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const raw = await res.text();
  if (raw.startsWith('event:') || raw.includes('\ndata:') || raw.startsWith('data:')) {
    const { text, usage, stop } = parseSSE(raw);
    if (!text) throw new Error(`Empty SSE response. Body: ${raw.slice(0, 300)}`);
    return { text, usage, stop };
  }
  const json = JSON.parse(raw);
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  const text = (json.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
  if (!text) throw new Error('Empty response from DeepSeek proxy');
  return { text, usage: json.usage, stop: json.stop_reason };
}

async function main() {
  const [target, ...rest] = process.argv.slice(2);
  const instruction = rest.join(' ');
  if (!target || !instruction) {
    console.error('Usage: node scripts/ds-write.mjs <targetRelPath> "<instruction>"');
    process.exit(1);
  }

  const spec = await readFile(resolve(ROOT, SPEC_FILE), 'utf8');

  const prompt = [
    'You are a senior Next.js 16 engineer. Build ONE file for the project described below.',
    '',
    '=== PROJECT BUILD SPEC (authoritative) ===',
    spec,
    '=== END SPEC ===',
    '',
    `TARGET FILE: ${target}`,
    '',
    'INSTRUCTION:',
    instruction,
    '',
    'OUTPUT RULES (critical):',
    '- Output ONLY the complete final contents of the target file.',
    '- No markdown code fences, no explanations, no commentary before or after.',
    '- Production-ready, type-safe, Next.js 16 + React 19 + Tailwind v4.',
    '- Follow the spec contracts, names, and Next.js 16 conventions EXACTLY.',
  ].join('\n');

  console.log(`[ds-write] generating ${target} (model=${MODEL}) ...`);
  const { text, usage, stop } = await callDeepSeek(prompt);
  const content = stripFences(text);

  const abs = resolve(ROOT, target);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, 'utf8');

  console.log(`[ds-write] wrote ${target} (${content.length} chars)`);
  if (usage) console.log(`[ds-write] tokens in=${usage.input_tokens} out=${usage.output_tokens} stop=${stop}`);
  if (stop === 'max_tokens') {
    console.warn('[ds-write] WARNING: output truncated at max_tokens — file may be incomplete.');
  }
}

main().catch((e) => {
  console.error('[ds-write] FAILED:', e.message);
  process.exit(1);
});
