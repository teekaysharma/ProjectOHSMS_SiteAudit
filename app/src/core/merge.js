import { verifyChains } from './eventLog.js';

/**
 * Union any number of event sets by eventId.
 *
 * Idempotent (importing the same file twice is a no-op) and commutative
 * (import order never affects the result — including under a conflict) —
 * the two properties that let auditors reconcile by passing files around
 * with no server (spec §7.2).
 *
 * Two events sharing an eventId but differing in content is an integrity
 * failure — corruption, or a forgery attempting to overwrite a genuine
 * record under its own ID. Per spec §7.2 this is "rejected... never
 * silently resolved": neither version is chosen. Both are excluded from
 * the merged set and reported in `conflicts` for a human to resolve. An
 * earlier version of this function kept whichever event it saw first,
 * which is order-dependent — a forger could win simply by being merged
 * first. Excluding both sides instead makes the result genuinely
 * order-independent, since there is no "first" left to depend on.
 *
 * A side effect worth expecting: excluding a conflicted event leaves a hole
 * in its device's sequence. `verification` (via `verifyChains`) will then
 * report a `seq_gap` for that device — which is the correct signal that
 * something in that device's chain needs human review, not a bug.
 *
 * @param {...object[]} eventSets
 */
export function mergeEvents(...eventSets) {
  const hashesById = new Map();
  const firstSeenById = new Map();
  let duplicates = 0;

  for (const set of eventSets) {
    for (const event of set || []) {
      let hashes = hashesById.get(event.eventId);
      if (!hashes) {
        hashes = new Set();
        hashesById.set(event.eventId, hashes);
        firstSeenById.set(event.eventId, event);
      } else if (hashes.has(event.hash)) {
        duplicates++;
        continue;
      }
      hashes.add(event.hash);
    }
  }

  const conflicts = [];
  const events = [];
  for (const [eventId, hashes] of hashesById) {
    if (hashes.size > 1) {
      conflicts.push({ eventId, hashes: [...hashes].sort() });
    } else {
      events.push(firstSeenById.get(eventId));
    }
  }

  // Deterministic order: by device, then seq, then eventId as a tiebreak.
  events.sort(
    (a, b) =>
      a.deviceId.localeCompare(b.deviceId) ||
      a.seq - b.seq ||
      a.eventId.localeCompare(b.eventId)
  );

  return { events, added: events.length, duplicates, conflicts, verification: verifyChains(events) };
}
