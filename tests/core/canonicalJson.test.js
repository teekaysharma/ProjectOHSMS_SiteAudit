import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalJson } from '../../src/core/canonicalJson.js';

test('key order does not affect output', () => {
  assert.equal(
    canonicalJson({ b: 1, a: 2 }),
    canonicalJson({ a: 2, b: 1 })
  );
  assert.equal(canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
});

test('nested objects are sorted recursively', () => {
  const x = { outer: { z: 1, a: { y: 2, b: 3 } } };
  const y = { outer: { a: { b: 3, y: 2 }, z: 1 } };
  assert.equal(canonicalJson(x), canonicalJson(y));
});

test('array order IS preserved', () => {
  assert.equal(canonicalJson([3, 1, 2]), '[3,1,2]');
  assert.notEqual(canonicalJson([1, 2]), canonicalJson([2, 1]));
});

test('null is preserved and distinct from absence', () => {
  assert.equal(canonicalJson({ a: null }), '{"a":null}');
});

test('rejects values that cannot hash deterministically', () => {
  assert.throws(() => canonicalJson({ a: undefined }), /undefined/);
  assert.throws(() => canonicalJson({ a: NaN }), /finite/);
  assert.throws(() => canonicalJson({ a: Infinity }), /finite/);
  assert.throws(() => canonicalJson({ a() {} }), /function/);
});

test('unicode strings round-trip identically', () => {
  const s = canonicalJson({ note: 'Ünïcödé — 日本語' });
  assert.equal(JSON.parse(s).note, 'Ünïcödé — 日本語');
});
