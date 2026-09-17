import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedRedirectUri, isRedirectRegistered } from './redirect.ts';

test('accepts the two Claude callbacks', () => {
  assert.equal(isAllowedRedirectUri('https://claude.ai/api/mcp/auth_callback'), true);
  assert.equal(isAllowedRedirectUri('https://claude.com/api/mcp/auth_callback'), true);
});

test('accepts localhost on any port for development', () => {
  assert.equal(isAllowedRedirectUri('http://localhost:6274/oauth/callback'), true);
  assert.equal(isAllowedRedirectUri('http://127.0.0.1:8080/cb'), true);
});

test('rejects an attacker host', () => {
  assert.equal(isAllowedRedirectUri('https://evil.example/cb'), false);
});

test('rejects lookalike hosts', () => {
  assert.equal(isAllowedRedirectUri('https://claude.ai.evil.example/cb'), false);
  assert.equal(isAllowedRedirectUri('https://notclaude.ai/api/mcp/auth_callback'), false);
});

test('rejects the right host with the wrong path', () => {
  assert.equal(isAllowedRedirectUri('https://claude.ai/evil'), false);
});

test('rejects plaintext http for a Claude host', () => {
  assert.equal(isAllowedRedirectUri('http://claude.ai/api/mcp/auth_callback'), false);
});

test('rejects malformed input rather than throwing', () => {
  assert.equal(isAllowedRedirectUri('not a url'), false);
  assert.equal(isAllowedRedirectUri(''), false);
});

// --- isRedirectRegistered -------------------------------------------------

test('a client may use the exact URI it registered', () => {
  assert.equal(
    isRedirectRegistered(['https://claude.ai/api/mcp/auth_callback'], 'https://claude.ai/api/mcp/auth_callback'),
    true
  );
});

test('claude.ai and claude.com are interchangeable for a client that registered either', () => {
  // Claude registers once but authorises from web, desktop or mobile, which do
  // not agree on the host. Both are pinned in the allowlist, so this widens nothing.
  assert.equal(
    isRedirectRegistered(['https://claude.ai/api/mcp/auth_callback'], 'https://claude.com/api/mcp/auth_callback'),
    true
  );
  assert.equal(
    isRedirectRegistered(['https://claude.com/api/mcp/auth_callback'], 'https://claude.ai/api/mcp/auth_callback'),
    true
  );
});

test('a loopback client does not gain the Anthropic callbacks', () => {
  assert.equal(
    isRedirectRegistered(['http://localhost:6274/callback'], 'https://claude.ai/api/mcp/auth_callback'),
    false
  );
});

test('an Anthropic-registered client does not gain an arbitrary loopback URI', () => {
  assert.equal(
    isRedirectRegistered(['https://claude.ai/api/mcp/auth_callback'], 'http://localhost:6274/callback'),
    false
  );
});

test('loopback stays exact-match per client', () => {
  assert.equal(isRedirectRegistered(['http://localhost:6274/callback'], 'http://localhost:9999/callback'), false);
  assert.equal(isRedirectRegistered(['http://localhost:6274/callback'], 'http://localhost:6274/callback'), true);
});

test('a client with no registered URIs gets nothing', () => {
  assert.equal(isRedirectRegistered([], 'https://claude.ai/api/mcp/auth_callback'), false);
});
