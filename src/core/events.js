import { sha256Hex } from './sha256.js';
import { canonicalJson } from './canonicalJson.js';
import { newId, ID_PREFIXES } from './ids.js';

/** Every event type in spec §6. */
export const EVENT_TYPES = Object.freeze([
  'site_created', 'site_updated',
  'project_created', 'project_updated',
  'assignment_created', 'assignment_updated',
  'phase_added', 'phase_updated', 'phase_status_changed', 'phase_removed',
  'question_activated', 'question_closed', 'question_reopened',
  'adhoc_question_created', 'adhoc_question_promoted',
  'catalogue_updated', 'status_vocabulary_updated', 'banding_updated',
  'audit_visit', 'audit_correction'
]);

/** Envelope fields covered by the hash, in no particular order (canonicalJson sorts). */
const HASHED_FIELDS = ['eventId', 'type', 'ts', 'deviceId', 'actor', 'seq', 'prevHash', 'payload'];

/**
 * @param {object} event
 * @returns {string} hex digest over every field except `hash`
 */
export function computeEventHash(event) {
  const subject = {};
  for (const f of HASHED_FIELDS) subject[f] = event[f];
  return sha256Hex(canonicalJson(subject));
}

/**
 * @param {object} event
 * @returns {boolean} true when the stored hash matches a recomputation
 */
export function verifyEventHash(event) {
  if (!event || typeof event.hash !== 'string') return false;
  return computeEventHash(event) === event.hash;
}

/**
 * Seal a new event. The returned object is frozen: events are immutable
 * (spec §6.2) and corrections are new events, never edits.
 */
export function createEvent({ type, deviceId, actor, payload, seq, prevHash = null, ts }) {
  if (!EVENT_TYPES.includes(type)) {
    throw new TypeError(`createEvent: unknown event type ${JSON.stringify(type)}`);
  }
  if (typeof deviceId !== 'string' || !deviceId.startsWith(`${ID_PREFIXES.device}_`)) {
    throw new TypeError('createEvent: deviceId must be a device id');
  }
  if (typeof actor !== 'string' || actor.length === 0) {
    throw new TypeError('createEvent: actor is required');
  }
  if (!Number.isInteger(seq) || seq < 1) {
    throw new TypeError('createEvent: seq must be a positive integer');
  }
  if (prevHash !== null && !/^[0-9a-f]{64}$/.test(prevHash)) {
    throw new TypeError('createEvent: prevHash must be null or a hex digest');
  }
  if (typeof ts !== 'string' || Number.isNaN(Date.parse(ts))) {
    throw new TypeError('createEvent: ts must be an ISO-8601 string');
  }
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('createEvent: payload must be an object');
  }

  const event = {
    eventId: newId(ID_PREFIXES.event),
    type, ts, deviceId, actor, seq, prevHash,
    payload
  };
  event.hash = computeEventHash(event);
  return Object.freeze(event);
}
