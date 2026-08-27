import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvent, computeEventHash, verifyEventHash, EVENT_TYPES } from '../../src/core/events.js';

const base = {
  type: 'site_created',
  deviceId: 'dev_00000000000000000000000000000001',
  actor: 'auditor@example.com',
  payload: { siteId: 'site_abc', name: 'Site A' },
  seq: 1,
  prevHash: null,
  ts: '2026-08-27T10:00:00.000Z'
};

test('createEvent produces a complete sealed envelope', () => {
  const e = createEvent(base);
  assert.match(e.eventId, /^evt_[0-9a-f]{32}$/);
  assert.equal(e.type, 'site_created');
  assert.equal(e.seq, 1);
  assert.equal(e.prevHash, null);
  assert.match(e.hash, /^[0-9a-f]{64}$/);
  assert.deepEqual(e.payload, base.payload);
  assert.ok(verifyEventHash(e));
});

test('the hash covers the payload', () => {
  const e = createEvent(base);
  const tampered = { ...e, payload: { ...e.payload, name: 'Site B' } };
  assert.equal(verifyEventHash(tampered), false);
});

test('the hash covers every envelope field', () => {
  const e = createEvent(base);
  for (const field of ['type', 'ts', 'deviceId', 'actor', 'seq', 'prevHash', 'eventId']) {
    const tampered = { ...e, [field]: field === 'seq' ? 99 : 'changed' };
    assert.equal(verifyEventHash(tampered), false, `${field} is not covered by the hash`);
  }
});

test('hashing ignores key insertion order', () => {
  const e = createEvent(base);
  const reordered = {
    payload: e.payload, hash: e.hash, prevHash: e.prevHash, seq: e.seq,
    actor: e.actor, deviceId: e.deviceId, ts: e.ts, type: e.type, eventId: e.eventId
  };
  assert.ok(verifyEventHash(reordered));
});

test('identical inputs hash identically', () => {
  const a = createEvent({ ...base });
  const b = { ...a };
  assert.equal(computeEventHash(a), computeEventHash(b));
});

test('unknown event types are rejected', () => {
  assert.throws(() => createEvent({ ...base, type: 'not_a_real_type' }), /unknown event type/);
});

test('required fields are validated', () => {
  assert.throws(() => createEvent({ ...base, deviceId: '' }), /deviceId/);
  assert.throws(() => createEvent({ ...base, seq: 0 }), /seq/);
  assert.throws(() => createEvent({ ...base, seq: 1.5 }), /seq/);
  assert.throws(() => createEvent({ ...base, ts: 'not-a-date' }), /ts/);
  assert.throws(() => createEvent({ ...base, payload: null }), /payload/);
});

test('every event type named in the spec is declared', () => {
  for (const t of [
    'site_created', 'site_updated', 'project_created', 'project_updated',
    'assignment_created', 'assignment_updated',
    'phase_added', 'phase_updated', 'phase_status_changed', 'phase_removed',
    'question_activated', 'question_closed', 'question_reopened',
    'adhoc_question_created', 'adhoc_question_promoted',
    'catalogue_updated', 'status_vocabulary_updated', 'banding_updated',
    'audit_visit', 'audit_correction'
  ]) {
    assert.ok(EVENT_TYPES.includes(t), `missing event type ${t}`);
  }
});
