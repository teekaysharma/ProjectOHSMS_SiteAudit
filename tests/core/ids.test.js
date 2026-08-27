import test from 'node:test';
import assert from 'node:assert/strict';
import { newId, ID_PREFIXES } from '../../src/core/ids.js';

test('ids carry their prefix and 32 hex chars', () => {
  const id = newId('site');
  assert.match(id, /^site_[0-9a-f]{32}$/);
});

test('ids are unique across many draws', () => {
  const seen = new Set();
  for (let i = 0; i < 20000; i++) seen.add(newId('evt'));
  assert.equal(seen.size, 20000);
});

test('prefix is validated', () => {
  assert.throws(() => newId(''), /prefix/);
  assert.throws(() => newId('has_underscore'), /prefix/);
  assert.throws(() => newId('UPPER'), /prefix/);
});

test('known entity prefixes are declared and frozen', () => {
  for (const p of ['event', 'device', 'site', 'project', 'assignment', 'phase', 'visit', 'photo']) {
    assert.ok(ID_PREFIXES[p], `missing prefix for ${p}`);
  }
  assert.ok(Object.isFrozen(ID_PREFIXES));
});
