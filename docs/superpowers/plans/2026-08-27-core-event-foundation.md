# Core Event Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the append-only, hash-chained event log and its merge algorithm — the tamper-evident spine that every later stage depends on.

**Architecture:** Pure functions over plain objects, no DOM, no I/O, no network. Events are immutable records carrying a per-device hash chain. Merging two auditors' files is a union by event ID, verified by re-checking every device chain. Persistence and projections are deliberately excluded — this plan produces a library that is correct in isolation and testable under Node.

**Tech Stack:** Vanilla JavaScript (ES modules), JSDoc type annotations, `node --test`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-27-ohsms-siteaudit-local-first-design.md` — this plan implements §6 (event envelope), §7.2 (merge) and §7.3–7.4 (tamper-evidence). It is the first half of stage 1 in spec §14; projections are the second half and get their own plan.

## Global Constraints

Every task's requirements implicitly include these. Values are copied verbatim from the spec.

- **No network calls.** Ever, in any code path. The tool is offline-first (spec §1.5).
- **No new runtime dependencies.** Only `vite` and `chart.js` are permitted (spec §11.2). Nothing in this plan may add a package.
- **Must work from a `file://` origin.** No dynamic `import()`, no top-level await, no `crypto.subtle` dependency (spec §11.3, §7.4).
- **Pure functions only in this plan.** No IndexedDB, no DOM, no `window`. Everything must run under plain Node.
- **Events are immutable.** Nothing may mutate an event after creation. Corrections are new events (spec §6.2).
- **Photos never enter the replay path.** Events reference `photoId` + `contentHash` only (spec §4).
- Existing code style: `public/js/*.js` uses IIFEs assigning to `window`. New core modules are **ES modules under `src/core/`** and must not touch `window`.

## Two refinements to the spec, decided at planning time

Both are improvements the spec's author (this session) should confirm; they are recorded here because they change §6 and §7.4.

**1. SHA-256 is a synchronous pure-JS implementation, not `crypto.subtle`.**
Spec §7.4 said to use `crypto.subtle.digest` where available with a pure-JS fallback, and flagged that `file://` support "must be verified on all four target platforms". Using the pure-JS implementation *unconditionally* removes that verification gate entirely, keeps hashing synchronous (async would infect every call site that creates an event), and behaves identically on every platform. Cost is negligible: hashing a small JSON envelope is sub-millisecond.

**2. The envelope gains a `seq` field.**
Spec §6 chains events by `prevHash` per device. Adding a monotonic per-device sequence number makes chain order unambiguous without trusting wall-clock `ts`, and makes a deletion from the middle of a chain detectable as a *gap* as well as a broken hash link.

---

### Task 1: SHA-256

**Files:**
- Create: `src/core/sha256.js`
- Test: `tests/core/sha256.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `sha256Hex(message: string): string` — lowercase hex, 64 chars.

- [ ] **Step 1: Write the failing test**

Create `tests/core/sha256.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex } from '../../src/core/sha256.js';

test('sha256 matches published vectors', () => {
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
  assert.equal(
    sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'),
    '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
  );
});

test('sha256 handles multi-byte UTF-8', () => {
  // "é" is 2 bytes in UTF-8; a naive charCodeAt implementation gets this wrong.
  // Both digests below were verified against node:crypto.
  assert.equal(
    sha256Hex('é'),
    '4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c'
  );
  assert.equal(
    sha256Hex('Ünïcödé — 日本語'),
    '5e1fe8d2fd7c1d59fa64b34e2db8edf51619add8f299f60636845b90cf6066fd'
  );
});

test('sha256 is deterministic and length-independent', () => {
  const long = 'x'.repeat(10000);
  assert.equal(sha256Hex(long), sha256Hex(long));
  assert.match(sha256Hex(long), /^[0-9a-f]{64}$/);
  // Crossing the 55/64-byte padding boundary must not break.
  for (const n of [54, 55, 56, 63, 64, 65, 119, 120]) {
    assert.match(sha256Hex('a'.repeat(n)), /^[0-9a-f]{64}$/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/sha256.test.js`
Expected: FAIL — cannot find module `../../src/core/sha256.js`.

- [ ] **Step 3: Write the implementation**

Create `src/core/sha256.js`:

```js
// Synchronous SHA-256. Deliberately not crypto.subtle: that is async and its
// availability on file:// origins varies by browser. See plan "refinement 1".

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function rotr(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * SHA-256 of a UTF-8 string.
 * @param {string} message
 * @returns {string} lowercase hex, 64 characters
 */
export function sha256Hex(message) {
  const bytes = new TextEncoder().encode(message);
  const bitLenLow = (bytes.length * 8) >>> 0;
  const bitLenHigh = Math.floor((bytes.length * 8) / 0x100000000);

  const blocks = Math.ceil((bytes.length + 9) / 64);
  const total = blocks * 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[bytes.length] = 0x80;

  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 8, bitLenHigh, false);
  dv.setUint32(total - 4, bitLenLow, false);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);
  const w = new Uint32Array(64);

  for (let blk = 0; blk < blocks; blk++) {
    const off = blk * 64;
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15];
      const y = w[i - 2];
      const s0 = (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0;
      const s1 = (rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3];
    let e = H[4], f = H[5], g = H[6], h = H[7];

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e;
      e = (d + t1) >>> 0;
      d = c; c = b; b = a;
      a = (t1 + t2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) out += H[i].toString(16).padStart(8, '0');
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/sha256.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/sha256.js tests/core/sha256.test.js
git commit -m "feat(core): add synchronous SHA-256"
```

---

### Task 2: Canonical JSON

Hashing is meaningless unless the same logical object always serialises to the same string. `JSON.stringify` does not guarantee that: key order follows insertion order, so two objects that are equal can produce different bytes and therefore different hashes.

**Files:**
- Create: `src/core/canonicalJson.js`
- Test: `tests/core/canonicalJson.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `canonicalJson(value: any): string`.

- [ ] **Step 1: Write the failing test**

Create `tests/core/canonicalJson.test.js`:

```js
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
  // Object.keys() sees only own enumerable string properties, so a naive
  // implementation serialises every Date/Map/Set/class instance to "{}" —
  // two different Dates would then hash identically. Reject them instead.
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
  // A naive "seen" set that never removes entries would wrongly reject this —
  // the same object referenced twice as siblings is legitimate, acyclic data.
  const shared = { v: 1 };
  assert.equal(canonicalJson({ a: shared, b: shared }), '{"a":{"v":1},"b":{"v":1}}');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/canonicalJson.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write the implementation**

Create `src/core/canonicalJson.js`:

```js
/**
 * Deterministic JSON serialisation for hashing.
 * Object keys are sorted; array order is preserved. Values that cannot be
 * hashed reproducibly are rejected loudly rather than silently dropped —
 * JSON.stringify turns `undefined` into nothing at all, which would let two
 * different objects produce the same hash. For the same reason, only plain
 * objects are accepted: Object.keys() sees only own enumerable string
 * properties, so a Date/Map/Set/class instance would otherwise serialise to
 * "{}" and two different Dates would hash identically. Circular references
 * are rejected with a clean error rather than overflowing the call stack.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  return serialise(value, '$', new Set());
}

function serialise(value, path, seen) {
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
    if (seen.has(value)) {
      throw new TypeError(`canonicalJson: circular reference at ${path}`);
    }
    seen.add(value);
    const parts = value.map((v, i) => serialise(v, `${path}[${i}]`, seen));
    seen.delete(value);
    return `[${parts.join(',')}]`;
  }

  if (t === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      throw new TypeError(
        `canonicalJson: only plain objects are serialisable at ${path} (got ${value.constructor?.name ?? 'unknown'})`
      );
    }
    if (seen.has(value)) {
      throw new TypeError(`canonicalJson: circular reference at ${path}`);
    }
    seen.add(value);
    const keys = Object.keys(value).sort();
    const parts = keys.map(
      (k) => `${JSON.stringify(k)}:${serialise(value[k], `${path}.${k}`, seen)}`
    );
    seen.delete(value);
    return `{${parts.join(',')}}`;
  }

  throw new TypeError(`canonicalJson: unsupported type ${t} at ${path}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/canonicalJson.test.js`
Expected: PASS, 10 tests.

- [ ] **Step 5: Point the test script at the whole test directory**

The `test` script names a single file, so nothing under `tests/core/` runs in CI —
`npm test` reports 2 tests while the core suite grows unwatched. Fixed here rather
than at the end of the plan so every later task is actually covered.

In `package.json`, change:

```json
"test": "node --test tests/api.test.js"
```

to:

```json
"test": "node --test"
```

With no path argument, Node's test runner discovers test files itself from the
working directory (excluding `node_modules`). Do **not** pass `tests/` — on
Node 22+ a path argument is treated as a module to load, not a directory to
search, and `node --test tests/` fails with "Cannot find module …/tests"
(verified on Node 24). Do not use a shell glob such as `tests/**/*.test.js`
either: `**` needs `globstar` to recurse in `sh`, so it would silently stop
matching once tests nest deeper than one level.

`tests/api.test.js` still passes and keeps running; it is removed later, when
`server.js` goes.

- [ ] **Step 6: Confirm the whole suite runs**

Run: `npm test`
Expected: PASS, and the reported count now includes `tests/core/sha256.test.js`
and `tests/core/canonicalJson.test.js` — not just the two API tests.

- [ ] **Step 7: Commit**

```bash
git add src/core/canonicalJson.js tests/core/canonicalJson.test.js package.json
git commit -m "feat(core): add canonical JSON serialisation for hashing"
```

---

### Task 3: Identifiers

**Files:**
- Create: `src/core/ids.js`
- Test: `tests/core/ids.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `newId(prefix: string): string` — e.g. `newId('site')` → `site_9f2c…` (32 hex chars after the underscore)
  - `ID_PREFIXES` — frozen map of the entity prefixes used across the app.

- [ ] **Step 1: Write the failing test**

Create `tests/core/ids.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/ids.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write the implementation**

Create `src/core/ids.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/ids.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/ids.js tests/core/ids.test.js
git commit -m "feat(core): add prefixed stable identifiers"
```

---

### Task 4: Event envelope

**Files:**
- Create: `src/core/events.js`
- Test: `tests/core/events.test.js`

**Interfaces:**
- Consumes: `sha256Hex` (Task 1), `canonicalJson` (Task 2), `newId`/`ID_PREFIXES` (Task 3).
- Produces:
  - `EVENT_TYPES: readonly string[]`
  - `createEvent({ type, deviceId, actor, payload, seq, prevHash, ts }): Event`
  - `computeEventHash(event): string` — hash over every field except `hash`
  - `verifyEventHash(event): boolean`

An `Event` is `{ eventId, type, ts, deviceId, actor, seq, prevHash, hash, payload }`.

- [ ] **Step 1: Write the failing test**

Create `tests/core/events.test.js`:

```js
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

test('the payload is deep-frozen, not just the top-level event', () => {
  const e = createEvent({ ...base, payload: { siteId: 'site_1', nested: { name: 'Original' } } });
  assert.ok(Object.isFrozen(e.payload));
  assert.ok(Object.isFrozen(e.payload.nested));
  assert.throws(() => { e.payload.nested.name = 'MUTATED'; }, /Cannot assign to read only property|not extensible/);
  // In non-strict mode a frozen-property assignment fails silently rather than throwing.
  // Confirm the value genuinely didn't change either way, since 'use strict' isn't
  // guaranteed inside node:test's module context:
  assert.equal(e.payload.nested.name, 'Original');
});

test('mutating the callers original payload object after createEvent does not affect the sealed event', () => {
  const original = { siteId: 'site_1', name: 'Original' };
  const e = createEvent({ ...base, payload: original });
  original.name = 'CHANGED BY CALLER';
  assert.equal(e.payload.name, 'Original');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/events.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write the implementation**

Create `src/core/events.js`:

```js
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
 * Recursively clone and freeze a value. `Object.freeze` alone is shallow: a
 * frozen event whose `payload` is a plain (unfrozen) object can still have
 * that payload mutated in place after the event is "sealed" — silently, with
 * no exception. Cloning rather than freezing the caller's own reference also
 * stops the caller mutating their own object out from under the sealed event
 * later.
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  const clone = Array.isArray(value) ? [] : {};
  for (const key of Object.keys(value)) {
    clone[key] = deepFreeze(value[key]);
  }
  return Object.freeze(clone);
}

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
 * Seal a new event. The returned object — and its payload, recursively — is
 * frozen: events are immutable (spec §6.2) and corrections are new events,
 * never edits.
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
    payload: deepFreeze(payload)
  };
  event.hash = computeEventHash(event);
  return Object.freeze(event);
}
```

`payload` is already validated as a plain, non-array object above, so
`deepFreeze` only needs to branch on nested values, not re-validate the top
level. It runs before `computeEventHash`, so the stored hash covers the
frozen clone that actually ends up on the event — not the caller's original,
now-detached object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/events.test.js`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/events.js tests/core/events.test.js
git commit -m "feat(core): add hashed immutable event envelope"
```

---

### Task 5: Event log and chain verification

**Files:**
- Create: `src/core/eventLog.js`
- Test: `tests/core/eventLog.test.js`

**Interfaces:**
- Consumes: `createEvent`, `verifyEventHash`, `computeEventHash` (Task 4).
- Produces:
  - `createLog(deviceId): EventLog` — a fresh, empty log. There is deliberately
    no way to construct a log pre-seeded with existing events; see the note
    after Step 3.
  - `EventLog#append({ type, actor, payload, ts }): Event` — assigns `seq` and `prevHash` automatically
  - `EventLog#all(): Event[]`
  - `verifyChains(events): { ok: boolean, problems: Problem[] }` where `Problem` is `{ kind, deviceId, seq?, eventId? }` and `kind` is one of `'bad_hash' | 'broken_link' | 'seq_gap' | 'duplicate_seq'`

- [ ] **Step 1: Write the failing test**

Create `tests/core/eventLog.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/eventLog.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write the implementation**

Create `src/core/eventLog.js`:

```js
import { createEvent, verifyEventHash } from './events.js';

/**
 * An append-only log for a single device. Each device maintains its own chain,
 * so devices working offline never invalidate one another (spec §6).
 *
 * Deliberately takes only `deviceId`: an earlier version of this function
 * accepted a second `existingEvents` parameter to let a log resume from a
 * previously-saved set, but `head` was derived from the array's last
 * element rather than its highest `seq` — passing events out of order (e.g.
 * loaded from storage without an explicit sort) silently set `head` to the
 * wrong predecessor, and every event appended afterwards then chained off
 * it. `verifyChains` correctly reported the resulting chain as broken even
 * though the underlying data was never tampered with — a false positive on
 * an auditor's own legitimate work, which is close to the worst failure
 * mode an evidentiary tool can produce. Nothing in this plan uses that
 * parameter (Task 6's merge operates on raw event arrays directly), so it
 * is removed rather than patched: "resume a device's log across app
 * restarts" is a real need, but it belongs to whichever later plan
 * implements persistence, where it can be designed and tested against
 * actual storage behaviour instead of bolted on speculatively here.
 */
export function createLog(deviceId) {
  const events = [];
  let seq = 0;
  let head = null;

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
    // The last event confirmed NOT to be a duplicate — the actual reference
    // point for the next event's expected seq/prevHash. Deliberately not
    // "the previous array element": if that element was itself flagged
    // duplicate_seq, using it anyway would misattribute a broken_link to
    // the event that comes after a forged duplicate, even though that event
    // is perfectly legitimate.
    let lastGood = null;

    for (const e of sorted) {
      if (lastGood !== null && lastGood.seq === e.seq) {
        problems.push({ kind: 'duplicate_seq', deviceId, seq: e.seq, eventId: e.eventId });
        continue;
      }

      // The first event we hold for a device need not be seq 1 — an auditor
      // may have imported a partial file — so lastGood === null skips the
      // seq/prevHash checks rather than assuming seq 1 or prevHash null.
      const expectedSeq = lastGood === null ? e.seq : lastGood.seq + 1;
      if (e.seq !== expectedSeq) {
        problems.push({ kind: 'seq_gap', deviceId, seq: e.seq, eventId: e.eventId });
      }

      const expectedPrev = lastGood === null ? null : lastGood.hash;
      if (lastGood !== null && e.prevHash !== expectedPrev) {
        problems.push({ kind: 'broken_link', deviceId, seq: e.seq, eventId: e.eventId });
      }

      lastGood = e;
    }
  }

  return { ok: problems.length === 0, problems };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/eventLog.test.js`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/eventLog.js tests/core/eventLog.test.js
git commit -m "feat(core): add append-only event log with chain verification"
```

---

### Task 6: Merge

This is what makes multi-auditor reconciliation work (spec §7.2): a union by event ID that is idempotent and order-independent, so importing the same file twice changes nothing and importing in any order gives the same result.

**A design correction made before this task was implemented.** An earlier
version of this section's reference code kept whichever event it encountered
*first* when two events shared an `eventId` but differed in content (a
genuine conflict — corruption, or a forgery attempting to overwrite a real
record under its ID). That is order-dependent: `mergeEvents(genuine, forged)`
and `mergeEvents(forged, genuine)` produced different "winners" depending
purely on argument order. That directly contradicts spec §7.2's own stated
guarantees — "commutative" and "the import is rejected and reported; it is
never silently resolved" — and was confirmed with a concrete genuine-vs-forged
repro before any code was written. The design below excludes **both** sides
of a genuine conflict from the merged set instead: nothing is silently
chosen, the result is truly order-independent (there is no "first" to be
order-dependent about), and the disputed content surfaces for a human to
resolve via `conflicts`, not by algorithm.

**Files:**
- Create: `src/core/merge.js`
- Test: `tests/core/merge.test.js`
- Modify: `package.json` — change the `test` script to run the whole `tests/` directory

**Interfaces:**
- Consumes: `verifyChains` (Task 5).
- Produces: `mergeEvents(...eventSets): { events, added, duplicates, conflicts, verification }` —
  `conflicts` is `{ eventId, hashes: string[] }[]`, one entry per `eventId`
  that had more than one distinct hash across the merged sets, listing every
  distinct hash seen (sorted, so the shape itself is order-independent).

- [ ] **Step 1: Write the failing test**

Create `tests/core/merge.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeEvents } from '../../src/core/merge.js';
import { createLog } from '../../src/core/eventLog.js';
import { computeEventHash } from '../../src/core/events.js';
import { newId, ID_PREFIXES } from '../../src/core/ids.js';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/merge.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write the implementation**

Create `src/core/merge.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/merge.test.js`
Expected: PASS, 9 tests.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS — all core tests plus the two existing API tests. (The `test`
script was pointed at the whole `tests/` directory back in Task 2, so every
core test written since then runs here.)

- [ ] **Step 6: Verify the CI gates still pass**

Run each exactly as `.github/workflows/ci.yml` does:

```bash
npm run build && npm test && npm audit --audit-level=high
```

Expected: build succeeds, all tests pass, audit exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/core/merge.js tests/core/merge.test.js
git commit -m "feat(core): add idempotent event merge with conflict detection"
```

---

## Done when

- `npm test` runs every core test and passes.
- `npm run build` still succeeds and `npm audit --audit-level=high` still exits 0.
- No new dependency appears in `package.json`.
- Nothing under `src/core/` imports the DOM, `window`, IndexedDB, or the network.

## Not in this plan

Deliberately excluded, each with its own later plan:

- **Projections** — entities, phase trees and rollup, question applicability, visits, scoring and banding versions. This is the other half of spec §14 stage 1.
- **Persistence** — the IndexedDB adapter and draft storage.
- **File format** — the `formatVersion` envelope, index regeneration, photo inlining on export (spec §7.1).
- Everything in spec §14 stages 2–5.
