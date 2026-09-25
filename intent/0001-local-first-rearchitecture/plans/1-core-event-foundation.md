# Stage 1: Core Event Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the append-only, hash-chained event log and its merge algorithm — the tamper-evident spine every later stage depends on.

**Architecture:** Pure functions over plain objects, no DOM, no I/O, no network. Events are immutable records carrying a per-device hash chain. Merging two auditors' files is a union by event ID, verified by re-checking every device chain.

**Tech Stack:** Vanilla JavaScript (ES modules), `node --test`. No new dependencies.

**Spec:** [`../spec.md`](../spec.md) §6 (event envelope), §7.2 (merge), §7.3–7.4 (tamper-evidence).

## Provenance — read this before the tasks below

This stage was designed and built on a desktop session, on branch `plan/core-event-foundation`,
starting 2026-08-27 — before this repository's `intent/`-based process existed. It used the
superpowers `writing-plans` / `subagent-driven-development` skills against a plan document at
the old location, `docs/superpowers/plans/2026-08-27-core-event-foundation.md`. That plan and
its full ledger remain on that branch for the complete record; this document reconciles the
finished, tested result into the current structure (`app/src/core/`, `intent/0001-.../plans/`)
without re-executing the work.

Two things changed in the move, both mechanical:
- `src/core/*.js` → `app/src/core/*.js` (this repo's planned layout, `CLAUDE.md` Architecture).
- The `test` script now lists every file explicitly, matching this repo's convention (Stage 0,
  Review Focus point 5) rather than the bare `node --test` auto-discovery the original branch
  used, which was itself a correction of a plan bug — see Task 2's ledger entry below.

No source line changed. `npm test` (57/57), `npm run build`, `npm run build:app` and
`npm audit --audit-level=high` all pass after the move; see the Execution ledger.

## Global Constraints

- No network calls, ever, in any code path.
- No new runtime dependencies.
- Must work from a `file://` origin: no dynamic `import()`, no top-level await, no
  `crypto.subtle` (see Ruling below — this constraint was tightened during the work).
- Pure functions only: no DOM, no `window`, no IndexedDB.
- Events are immutable. Nothing may mutate an event after creation.
- Photos never enter the replay path (deferred to Stage 3; the interface leaves room for a
  `photoId` reference, nothing more, in this stage).

## Review Focus

1. `app/src/core/canonicalJson.js` rejects non-plain objects (`Date`, `Map`, `Set`, class
   instances) and circular references — both were Critical findings against the original
   design, fixed and tested (Task 2 ledger).
2. `app/src/core/events.js`'s `createEvent` deep-freezes the payload, not just the top-level
   event object — a Critical finding against the original design (Task 4 ledger). A shallow
   freeze here would silently defeat every downstream tamper-evidence guarantee.
3. `app/src/core/eventLog.js`'s `verifyChains` must not produce a false positive on clean
   data, and must not misattribute a `broken_link` to an innocent event after a forged
   duplicate — both were real bugs (Task 5 ledger), not hypothetical.
4. `app/src/core/merge.js`'s conflict handling must be genuinely order-independent: excluding
   both sides of a conflict, never picking a "first-seen" winner. This is a deliberate
   deviation from spec-drafting convenience toward the spec's own literal words (§7.2,
   "rejected... never silently resolved"), caught before any code was written for this task.
5. Every one of the four points above has a covering test that fails if the fix is reverted —
   confirm by reading the test, not by trusting the commit message.

---

### Task 1: SHA-256

**Files:** `app/src/core/sha256.js`, `tests/core/sha256.test.js`

**Interfaces:** `sha256Hex(message: string): string` — lowercase hex, 64 chars. No imports.

A synchronous, pure-JS SHA-256 used unconditionally — not `crypto.subtle` with a fallback.
This is a deliberate narrowing of the constraint originally proposed in `spec.md` §7.4 (which
allowed `crypto.subtle` where available): async hashing would have infected every call site
that creates an event, and Web Crypto's availability from `file://` is unverified on the four
target platforms (spec concern C2). Verified against `node:crypto` across published test
vectors, the 55/56/63/64/65-byte padding boundaries, multi-byte UTF-8, and — separately, by
the controller, not part of the committed suite — 3,000 random fuzzed strings with zero
mismatches.

- [x] Written, tested, reviewed. See `app/src/core/sha256.js` and `tests/core/sha256.test.js`.

### Task 2: Canonical JSON

**Files:** `app/src/core/canonicalJson.js`, `tests/core/canonicalJson.test.js`

**Interfaces:** `canonicalJson(value: unknown): string`. Sorts object keys recursively;
preserves array order; throws on `undefined`, non-finite numbers, functions, non-plain
objects, and circular references, rather than silently producing a value that could collide
with a structurally different input.

Hashing is meaningless unless the same logical object always serialises to identical bytes.
The first version of this function used `Object.keys()` on any object, so a `Date`, `Map`,
`Set`, or class instance serialised to `"{}"` — two different `Date` values would then hash
identically, a collision by construction in the primitive underpinning the whole chain
(Critical). It also had no cycle guard, so a self-referential object overflowed the call
stack instead of throwing the module's own clean error (Important). Both fixed: a prototype
check rejects non-plain objects before key-sorting; an ancestor `Set`, added before recursing
and removed after, catches genuine cycles while still allowing the same object to appear
twice as siblings (not a cycle).

- [x] Written, tested, reviewed, fixed, re-reviewed clean. See files above.

### Task 3: Identifiers

**Files:** `app/src/core/ids.js`, `tests/core/ids.test.js`

**Interfaces:** `newId(prefix: string): string` (e.g. `newId('site')` → `site_<32 hex>`);
`ID_PREFIXES`, a frozen map of entity prefixes. Entities are identified by these IDs, never by
display name, so renaming a project or site never breaks a reference.

Uses `globalThis.crypto.getRandomValues` (available in browsers and Node ≥19) — a genuine
CSPRNG, no fallback to a weak source. Verified by the controller: 200,000 draws, zero
collisions, roughly uniform hex-digit distribution.

- [x] Written, tested, reviewed clean (no Critical or Important findings).

### Task 4: Event envelope

**Files:** `app/src/core/events.js`, `tests/core/events.test.js`

**Interfaces:** `EVENT_TYPES`; `createEvent({ type, deviceId, actor, payload, seq, prevHash, ts }): Event`; `computeEventHash(event): string`; `verifyEventHash(event): boolean`.

The most safety-critical module in this stage: every later task trusts that a "sealed" event
genuinely cannot be altered. The first version called `Object.freeze(event)` — a **shallow**
freeze, so `event.payload` stayed a mutable object after sealing. Mutating it produced no
exception and no signal; only an explicit `verifyEventHash` call would later reveal the
divergence (Critical). None of the original tests exercised direct payload mutation, so the
suite would have passed identically before and after a correct fix (Important — a test gap,
not just a code gap). Fixed with a `deepFreeze` helper that clones and freezes the payload,
including nested objects and arrays, before it is assigned onto the event and before the hash
is computed over it. Cloning rather than freezing the caller's own reference also stops the
caller mutating their original object out from under the sealed event later — verified by the
controller with a payload containing both a nested object and a nested array.

- [x] Written, tested, reviewed, fixed, re-reviewed clean. See files above.

### Task 5: Event log and chain verification

**Files:** `app/src/core/eventLog.js`, `tests/core/eventLog.test.js`

**Interfaces:** `createLog(deviceId): EventLog` — `EventLog#append({ type, actor, payload, ts }): Event`, `EventLog#all(): Event[]`; `verifyChains(events): { ok, problems }`, `problems[].kind` one of `bad_hash | broken_link | seq_gap | duplicate_seq`.

Two real bugs, both caught before this task's review closed, neither hypothetical:

- **Critical.** An earlier draft of `createLog` took a second, undocumented parameter to
  resume a device's log from a previously-saved set of events, deriving `head` from the
  array's *last element* rather than its *highest seq*. Passing events out of order (exactly
  what loading from storage without an explicit sort would do) silently set the wrong
  predecessor hash — and `verifyChains` then correctly reported the resulting chain as
  broken, even though the underlying data had never been tampered with. **A false positive on
  an auditor's own legitimate work is close to the worst failure mode this tool can produce.**
  Fixed by removing the parameter: nothing in this stage used it, it was never in the
  documented interface, and "resume a log across app restarts" is real but belongs to
  whichever later stage implements persistence, where it can be designed and tested against
  actual storage behaviour instead of bolted on speculatively here.
- **Important.** After a `duplicate_seq` match (two events sharing one seq — corruption, or a
  forgery reusing an ID), the check for the *next* event used the array position immediately
  before it, which could be the duplicate itself, misattributing a spurious `broken_link` to
  an unrelated, entirely legitimate event further down the chain. Fixed by tracking the last
  confirmed-good event explicitly, advanced only when the current event is not itself a
  duplicate.

- [x] Written, tested, reviewed, fixed, re-reviewed clean. See files above.

### Task 6: Merge

**Files:** `app/src/core/merge.js`, `tests/core/merge.test.js`

**Interfaces:** `mergeEvents(...eventSets): { events, added, duplicates, conflicts, verification }` — `conflicts` is `{ eventId, hashes: string[] }[]`.

Caught before any code was written for this task, by re-reading the drafted design against
`spec.md` §7.2 itself: the reference implementation kept whichever event it saw first when two
events shared an `eventId` but differed in content — a genuine conflict, meaning corruption or
a forgery attempting to overwrite a real record under its own ID. That is order-dependent,
confirmed with a concrete repro (`mergeEvents(genuine, forged)` and
`mergeEvents(forged, genuine)` produced different "winners"), and directly contradicts the
spec's own stated guarantees: "commutative (import order does not affect the result)" and "the
import is rejected and reported; it is never silently resolved."

This was escalated rather than silently fixed, since more than one legitimate resolution
existed. The owner chose: on a genuine conflict, **exclude both sides** from the merged set
entirely, reported via `conflicts` for a human to resolve. This makes the result genuinely
order-independent — there is no "first" left to depend on — and a forger can no longer win a
race simply by being merged first. A side effect is intentional, not a bug: excluding a
conflicted event leaves a hole in its device's sequence, which `verifyChains` then reports as
a `seq_gap` for that device — the correct signal that something needs human review.

- [x] Written, tested, reviewed clean on the first pass (the design was corrected before
      implementation began, so no fix round was needed here).

---

## Execution ledger

Executed via `subagent-driven-development` (fresh implementer subagent per task, independent
reviewer per task, controller-run independent verification before every review dispatch) on
the desktop session, branch `plan/core-event-foundation`, 2026-08-27 to 2026-09-25.

| Task | Commits (original branch) | Review outcome |
|---|---|---|
| 1. SHA-256 | `3cd99a3..5e81c22` | Clean. Controller fuzzed 3,000 random strings against `node:crypto` independently of the committed suite. |
| 2. Canonical JSON | `eae0bca..f3823fe` | 1 Critical (non-plain-object collision), 1 Important (no cycle guard), 2 Minor deferred. Fix round 1/5, re-review: both addressed, no new breakage. |
| 3. Identifiers | `e933de0..b879161` | Clean. Controller verified 200k draws, 0 collisions. |
| 4. Event envelope | `b879161..c81dc4d` | 1 Critical (shallow freeze on payload), 1 Important (no test caught it), 2 Minor deferred. Fix round 1/5, re-review: both addressed. |
| 5. Event log + chain verification | `b879161..7507537` | 1 Critical (false-positive tamper alarm from an unsorted-resume parameter), 1 Important (misattributed `broken_link` after a forged duplicate), 1 Minor deferred. Fix round 1/5, re-review: both addressed. |
| 6. Merge | `c5ea06c..c853e29` | Design conflict with spec §7.2 found and escalated *before* implementation began; owner decided; clean review on first pass. |

Full per-finding detail, every controller repro script, and every reviewer's independent
verification note are in the original branch's SDD ledger
(`.superpowers/sdd/2026-08-27-core-event-foundation/progress.md`, git-ignored scratch, not
committed) and in the original plan document's own edit history
(`docs/superpowers/plans/2026-08-27-core-event-foundation.md` on `plan/core-event-foundation`).

**Rulings:**

- Ruling: SHA-256 is synchronous pure-JS, used unconditionally, not `crypto.subtle` with a
  fallback. Why: async hashing would infect every call site that creates an event; Web
  Crypto's availability from `file://` is unverified on the target platforms (spec concern
  C2 is closed by this choice, not merely carried forward). Cost if wrong: none identified —
  verified correct against `node:crypto` at scale.
- Ruling: `createLog`'s resume-from-existing-events parameter is removed rather than fixed.
  Why: it was untested, undocumented in the stated interface, unused by anything in this
  stage, and its one real use (resuming a device's log across app restarts) is a persistence
  concern that belongs to a later stage. Cost if wrong: that stage re-adds the capability with
  its own design and tests, rather than inheriting one built without them.
- Ruling: a merge conflict excludes both sides rather than picking a canonical winner. Why:
  the spec's own words rule out "silently resolved"; excluding both is the only option of the
  three considered that requires no arbitrary rule and is order-independent by construction.
  Cost if wrong: a conflicted event needs explicit resolution before its device's chain reads
  clean again (a `seq_gap` persists until then) — judged acceptable since conflicts are a
  corruption/tampering path, not a routine one (spec §7.2).
- Ruling: this document does not re-embed the six files' source. Why: the code is the
  implementation, already reviewed and merged into this branch; duplicating ~600 lines into a
  planning document would drift from the real files immediately. Cost if wrong: a future
  reader wanting the code reads `app/src/core/`, not this file — judged the correct direction
  for a completed stage, unlike Stage 0's inline code, which specified work not yet done.
