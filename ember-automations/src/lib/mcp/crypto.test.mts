import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sha256, randomToken, verifyPkceS256 } from './crypto.ts';

test('sha256 returns lowercase hex of the right length', () => {
  const out = sha256('hello');
  assert.equal(out, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  assert.equal(out.length, 64);
});

test('sha256 is deterministic and input-sensitive', () => {
  assert.equal(sha256('a'), sha256('a'));
  assert.notEqual(sha256('a'), sha256('b'));
});

test('randomToken is base64url and unique', () => {
  const a = randomToken();
  const b = randomToken();
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
});

test('verifyPkceS256 accepts the RFC 7636 reference vector', () => {
  // RFC 7636 Appendix B
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
  assert.equal(verifyPkceS256(verifier, challenge), true);
});

test('verifyPkceS256 rejects a wrong verifier', () => {
  const challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
  assert.equal(verifyPkceS256('not-the-verifier', challenge), false);
});

test('verifyPkceS256 rejects empty input rather than matching', () => {
  assert.equal(verifyPkceS256('', ''), false);
});
