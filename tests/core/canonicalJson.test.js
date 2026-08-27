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

test('rejects non-plain objects that would collide', () => {
  assert.throws(() => canonicalJson(new Date('2020-01-01')), /plain object/);
  assert.throws(() => canonicalJson({ when: new Date('2020-01-01') }), /plain object/);
  assert.throws(() => canonicalJson(new Map([['a', 1]])), /plain object/);
  assert.throws(() => canonicalJson(new Set([1])), /plain object/);
  class Thing { constructor() { this.a = 1; } }
  assert.throws(() => canonicalJson(new Thing()), /plain object/);
});

test('objects with a null prototype are still plain', () => {
  const o = Object.create(null);
  o.b = 1;
  o.a = 2;
  assert.equal(canonicalJson(o), '{"a":2,"b":1}');
});

test('throws a clean error on circular references', () => {
  const a = { name: 'a' };
  a.self = a;
  assert.throws(() => canonicalJson(a), /circular reference/);
  const x = { k: 1 };
  const cyclicArray = [x];
  cyclicArray.push(cyclicArray);
  assert.throws(() => canonicalJson(cyclicArray), /circular reference/);
});

test('repeated non-cyclic references are fine', () => {
  const shared = { v: 1 };
  assert.equal(canonicalJson({ a: shared, b: shared }), '{"a":{"v":1},"b":{"v":1}}');
});
