import test from 'node:test';
import assert from 'node:assert/strict';
import { createLog, verifyChains } from '../../src/core/eventLog.js';
import { newId, ID_PREFIXES } from '../../src/core/ids.js';
import { computeEventHash } from '../../src/core/events.js';

function seed(n = 3) {
  const log = createLog(newId(ID_PREFIXES.device));
  for (let i = 0; i < n; i++) {
    log.append({
      type: 'site_created',
      actor: 'auditor@example.com',
      payload: { siteId: `site_${i}`, name: `Site ${i}` },
      ts: `2026-08-27T10:0${i}:00.000Z`
    });
  }
  return log;
}

test('append assigns increasing seq and links prevHash', () => {
  const log = seed(3);
  const events = log.all();
  assert.deepEqual(events.map((e) => e.seq), [1, 2, 3]);
  assert.equal(events[0].prevHash, null);
  assert.equal(events[1].prevHash, events[0].hash);
  assert.equal(events[2].prevHash, events[1].hash);
});

test('a clean chain verifies', () => {
  const { ok, problems } = verifyChains(seed(4).all());
  assert.equal(ok, true);
  assert.deepEqual(problems, []);
});

test('an empty log verifies', () => {
  assert.equal(verifyChains([]).ok, true);
});

test('editing a payload is detected as bad_hash', () => {
  const events = seed(3).all().map((e) => ({ ...e }));
  events[1].payload = { ...events[1].payload, name: 'TAMPERED' };
  const { ok, problems } = verifyChains(events);
  assert.equal(ok, false);
  assert.ok(problems.some((p) => p.kind === 'bad_hash'));
});

test('deleting a middle event is detected as a seq gap', () => {
  const events = seed(4).all();
  const withHole = [events[0], events[1], events[3]];
  const { ok, problems } = verifyChains(withHole);
  assert.equal(ok, false);
  assert.ok(problems.some((p) => p.kind === 'seq_gap'));
});

test('re-pointing prevHash is detected as a broken link', () => {
  const events = seed(3).all().map((e) => ({ ...e }));
  events[2].prevHash = events[0].hash;
  const { ok, problems } = verifyChains(events);
  assert.equal(ok, false);
  // The hash covers prevHash, so this surfaces as bad_hash and/or broken_link.
  assert.ok(problems.some((p) => p.kind === 'broken_link' || p.kind === 'bad_hash'));
});

test('verification is order-independent', () => {
  const events = seed(5).all();
  const shuffled = [...events].reverse();
  assert.equal(verifyChains(shuffled).ok, true);
});

test('two devices interleaved both verify', () => {
  const a = seed(3).all();
  const b = seed(2).all();
  assert.equal(verifyChains([...a, ...b]).ok, true);
  assert.equal(verifyChains([a[0], b[0], a[1], b[1], a[2]]).ok, true);
});

test('duplicate seq on one device is detected', () => {
  const events = seed(2).all().map((e) => ({ ...e }));
  const clone = { ...events[1] };
  const { ok, problems } = verifyChains([...events, clone]);
  assert.equal(ok, false);
  assert.ok(problems.some((p) => p.kind === 'duplicate_seq'));
});

test('a forged duplicate seq does not misattribute broken_link to a later legitimate event', () => {
  const a = createLog(newId(ID_PREFIXES.device));
  const genuine1 = a.append({ type: 'site_created', actor: 'a@b.com', payload: { v: 1 }, ts: '2026-02-01T00:00:00.000Z' });
  const genuine2 = a.append({ type: 'site_created', actor: 'a@b.com', payload: { v: 2 }, ts: '2026-02-02T00:00:00.000Z' });
  const genuine3 = a.append({ type: 'site_created', actor: 'a@b.com', payload: { v: 3 }, ts: '2026-02-03T00:00:00.000Z' });

  // A forged event: same device, same seq as genuine2, but genuinely different
  // content (not an identical clone) — simulates corruption, not a re-import.
  const forged2 = { ...genuine2, eventId: newId(ID_PREFIXES.event), payload: { v: 'FORGED' } };
  // Reseal its hash so it's internally self-consistent (a real forger controls
  // their own event's fields), but it still collides on seq with genuine2.
  const { hash, ...rest } = forged2;
  const resealed = { ...rest, hash: computeEventHash(rest) };

  const mixed = [genuine1, genuine2, resealed, genuine3];
  const { ok, problems } = verifyChains(mixed);

  assert.equal(ok, false);
  assert.ok(problems.some((p) => p.kind === 'duplicate_seq' && p.eventId === resealed.eventId));
  // The key assertion: genuine3 must NOT be blamed for a broken_link it doesn't have.
  assert.ok(!problems.some((p) => p.eventId === genuine3.eventId));
});
