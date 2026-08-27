/**
 * Stable identifiers. Names are display attributes and may change freely;
 * IDs never do. See spec §5.1.
 */

export const ID_PREFIXES = Object.freeze({
  event: 'evt',
  device: 'dev',
  site: 'site',
  project: 'proj',
  assignment: 'asgn',
  phase: 'phase',
  visit: 'visit',
  photo: 'photo',
  catalogue: 'cat',
  banding: 'band',
  status: 'status'
});

const PREFIX_RE = /^[a-z][a-z0-9]*$/;

function randomBytes(n) {
  const out = new Uint8Array(n);
  // globalThis.crypto exists in browsers and in Node >= 19.
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(out);
    return out;
  }
  throw new Error('ids: no secure random source available');
}

/**
 * @param {string} prefix short lowercase alphanumeric tag, e.g. 'site'
 * @returns {string} `${prefix}_${32 hex chars}`
 */
export function newId(prefix) {
  if (typeof prefix !== 'string' || !PREFIX_RE.test(prefix)) {
    throw new TypeError(
      `newId: prefix must match ${PREFIX_RE} (lowercase, no underscore), got ${JSON.stringify(prefix)}`
    );
  }
  const bytes = randomBytes(16);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return `${prefix}_${hex}`;
}
