import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex } from '../../src/core/sha256.js';

test('sha256 matches published vectors', () => {
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
  assert.equal(
    sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'),
    '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
  );
});

test('sha256 handles multi-byte UTF-8', () => {
  // "é" is 2 bytes in UTF-8; a naive charCodeAt implementation gets this wrong.
  // Both digests below were verified against node:crypto.
  assert.equal(
    sha256Hex('é'),
    '4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c'
  );
  assert.equal(
    sha256Hex('Ünïcödé — 日本語'),
    '5e1fe8d2fd7c1d59fa64b34e2db8edf51619add8f299f60636845b90cf6066fd'
  );
});

test('sha256 is deterministic and length-independent', () => {
  const long = 'x'.repeat(10000);
  assert.equal(sha256Hex(long), sha256Hex(long));
  assert.match(sha256Hex(long), /^[0-9a-f]{64}$/);
  // Crossing the 55/64-byte padding boundary must not break.
  for (const n of [54, 55, 56, 63, 64, 65, 119, 120]) {
    assert.match(sha256Hex('a'.repeat(n)), /^[0-9a-f]{64}$/);
  }
});
