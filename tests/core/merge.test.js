import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeEvents } from '../../app/src/core/merge.js';
import { createLog } from '../../app/src/core/eventLog.js';
import { computeEventHash } from '../../app/src/core/events.js';
import { newId, ID_PREFIXES } from '../../app/src/core/ids.js';

function auditor(n, count) {
  const log = createLog(newId(ID_PREFIXES.device));
  for (let i = 0; i < count; i++) {
    log.append({
      type: 'site_created',
      actor: `auditor${n}@example.com`,
      payload: { siteId: `site_${n}_${i}`, name: `Site ${n}-${i}` },
      ts: `2026-08-27T1${n}:0${i}:00.000Z`
    });
  }
  return log.all();
}

test('merging two auditors unions their events', () => {
  const a = auditor(1, 3);
  const b = auditor(2, 2);
  const r = mergeEvents(a, b);
  assert.equal(r.events.length, 5);
  assert.equal(r.added, 5);
  assert.equal(r.conflicts.length, 0);
  assert.equal(r.verification.ok, true);
});

test('importing the same file twice changes nothing', () => {
  const a = auditor(1, 3);
  const once = mergeEvents(a);
  const twice = mergeEvents(a, a);
  assert.equal(twice.events.length, once.events.length);
  assert.equal(twice.duplicates, 3);
  assert.deepEqual(
    twice.events.map((e) => e.eventId).sort(),
    once.events.map((e) => e.eventId).sort()
  );
});

test('merge is order-independent', () => {
  const a = auditor(1, 3);
  const b = auditor(2, 3);
  const ab = mergeEvents(a, b).events.map((e) => e.eventId).sort();
  const ba = mergeEvents(b, a).events.map((e) => e.eventId).sort();
  assert.deepEqual(ab, ba);
});

test('same eventId with different content excludes both sides, not a silent pick', () => {
  const a = auditor(1, 2);
  // Reseal the forgery so its hash genuinely differs. Spreading alone would
  // copy the original hash, which merge would (correctly) treat as a duplicate.
  const forged = { ...a[1], payload: { ...a[1].payload, name: 'FORGED' } };
  forged.hash = computeEventHash(forged);
  const r = mergeEvents(a, [forged]);
  assert.equal(r.conflicts.length, 1);
  assert.equal(r.conflicts[0].eventId, a[1].eventId);
  assert.deepEqual(r.conflicts[0].hashes, [a[1].hash, forged.hash].sort());
  // Neither version enters the merged set — a human resolves this, not an algorithm.
  assert.ok(!r.events.some((e) => e.eventId === a[1].eventId));
  // The non-conflicting sibling is unaffected.
  assert.ok(r.events.some((e) => e.eventId === a[0].eventId));
});

test('a conflict is genuinely order-independent, not just reported both ways', () => {
  const a = auditor(1, 2);
  const forged = { ...a[1], payload: { ...a[1].payload, name: 'FORGED' } };
  forged.hash = computeEventHash(forged);
  const r1 = mergeEvents(a, [forged]);
  const r2 = mergeEvents([forged], a);
  assert.deepEqual(
    r1.events.map((e) => e.eventId).sort(),
    r2.events.map((e) => e.eventId).sort()
  );
  assert.equal(r1.conflicts.length, r2.conflicts.length);
});

test('excluding a conflicted event surfaces as a seq_gap for its device', () => {
  const a = auditor(1, 3);
  const forged2 = { ...a[1], payload: { ...a[1].payload, name: 'FORGED' } };
  forged2.hash = computeEventHash(forged2);
  const r = mergeEvents(a, [forged2]);
  assert.equal(r.verification.ok, false);
  assert.ok(r.verification.problems.some((p) => p.kind === 'seq_gap'));
});

test('merging reports chain problems from tampered input', () => {
  const a = auditor(1, 3).map((e) => ({ ...e }));
  a[1] = { ...a[1], payload: { ...a[1].payload, name: 'TAMPERED' } };
  const r = mergeEvents(a);
  assert.equal(r.verification.ok, false);
});

test('merging nothing yields an empty verified set', () => {
  const r = mergeEvents();
  assert.deepEqual(r.events, []);
  assert.equal(r.verification.ok, true);
});

test('merged output is sorted deterministically', () => {
  const a = auditor(1, 3);
  const b = auditor(2, 3);
  const one = mergeEvents(a, b).events.map((e) => e.eventId);
  const two = mergeEvents(b, a).events.map((e) => e.eventId);
  assert.deepEqual(one, two);
});
