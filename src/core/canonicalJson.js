/**
 * Deterministic JSON serialisation for hashing.
 * Object keys are sorted; array order is preserved. Values that cannot be
 * hashed reproducibly are rejected loudly rather than silently dropped —
 * JSON.stringify turns `undefined` into nothing at all, which would let two
 * different objects produce the same hash.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  return serialise(value, '$');
}

function serialise(value, path) {
  if (value === null) return 'null';

  const t = typeof value;

  if (t === 'undefined') {
    throw new TypeError(`canonicalJson: undefined is not serialisable at ${path}`);
  }
  if (t === 'function') {
    throw new TypeError(`canonicalJson: function is not serialisable at ${path}`);
  }
  if (t === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`canonicalJson: number must be finite at ${path}`);
    }
    return JSON.stringify(value);
  }
  if (t === 'boolean' || t === 'string') return JSON.stringify(value);

  if (Array.isArray(value)) {
    const parts = value.map((v, i) => serialise(v, `${path}[${i}]`));
    return `[${parts.join(',')}]`;
  }

  if (t === 'object') {
    const keys = Object.keys(value).sort();
    const parts = keys.map(
      (k) => `${JSON.stringify(k)}:${serialise(value[k], `${path}.${k}`)}`
    );
    return `{${parts.join(',')}}`;
  }

  throw new TypeError(`canonicalJson: unsupported type ${t} at ${path}`);
}
