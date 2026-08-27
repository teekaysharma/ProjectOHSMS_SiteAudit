import { createEvent, verifyEventHash } from './events.js';

/**
 * An append-only log for a single device. Each device maintains its own chain,
 * so devices working offline never invalidate one another (spec §6).
 */
export function createLog(deviceId, existingEvents = []) {
  const events = [...existingEvents];
  let seq = events.reduce((m, e) => Math.max(m, e.seq), 0);
  let head = events.length ? events[events.length - 1].hash : null;

  return {
    deviceId,

    append({ type, actor, payload, ts = new Date().toISOString() }) {
      const event = createEvent({
        type, deviceId, actor, payload,
        seq: seq + 1,
        prevHash: head,
        ts
      });
      events.push(event);
      seq = event.seq;
      head = event.hash;
      return event;
    },

    all() {
      return [...events];
    },

    get head() {
      return head;
    }
  };
}

/**
 * Verify every per-device chain in a set of events. Order-independent: events
 * are grouped by device and sorted by seq before checking.
 *
 * @param {object[]} events
 * @returns {{ ok: boolean, problems: object[] }}
 */
export function verifyChains(events) {
  const problems = [];
  const byDevice = new Map();

  for (const e of events) {
    if (!verifyEventHash(e)) {
      problems.push({ kind: 'bad_hash', deviceId: e.deviceId, seq: e.seq, eventId: e.eventId });
    }
    if (!byDevice.has(e.deviceId)) byDevice.set(e.deviceId, []);
    byDevice.get(e.deviceId).push(e);
  }

  for (const [deviceId, list] of byDevice) {
    const sorted = [...list].sort((a, b) => a.seq - b.seq);

    for (let i = 0; i < sorted.length; i++) {
      const e = sorted[i];

      if (i > 0 && sorted[i - 1].seq === e.seq) {
        problems.push({ kind: 'duplicate_seq', deviceId, seq: e.seq, eventId: e.eventId });
        continue;
      }

      const expectedSeq = i === 0 ? sorted[0].seq : sorted[i - 1].seq + 1;
      if (e.seq !== expectedSeq) {
        problems.push({ kind: 'seq_gap', deviceId, seq: e.seq, eventId: e.eventId });
      }

      const expectedPrev = i === 0 ? null : sorted[i - 1].hash;
      // The first event we hold for a device need not be seq 1 — an auditor may
      // have imported a partial file — so only check links between adjacent
      // events we actually have.
      if (i > 0 && e.prevHash !== expectedPrev) {
        problems.push({ kind: 'broken_link', deviceId, seq: e.seq, eventId: e.eventId });
      }
    }
  }

  return { ok: problems.length === 0, problems };
}
