# OHSMS Site Audit — Local-First Rearchitecture

**Date:** 2026-08-27
**Status:** Design — awaiting approval
**Supersedes:** `MVP_GAP_SECURITY_PLAN.md` (hosted multi-user direction, abandoned)

> This document reconciles two brainstorming conversations that forked in the UI on
> 2026-08-27. Neither transcript was authoritative on its own: one branch established the
> *why* (evidence-grade records, device constraints), the other established the *domain*
> (scope-differentiated concurrent work, phase trees). This spec is the merge point.

---

## 1. Context and goals

`ProjectOHSMS_SiteAudit` is a Vite/vanilla-JS OHS audit tool: a project-wide Management
System Audit plus site-specific Site Performance Audits, scored 0–5, with dashboards and
printable reports.

It is being rearchitected into a **single-file, fully local, portable** tool for field HSE
auditors. Goals, in priority order:

1. **No platform lock-in.** No Render, Railway, Vercel, or any hosted backend. The
   deliverable is one HTML file that runs from local storage on a tablet or laptop.
2. **Evidence-grade records.** Audits are used in disputes on construction sites. Records
   must be defensible, attributable, and not silently editable after the fact.
3. **Many-to-many projects and sites**, with scope-differentiated concurrent engagements.
4. **Full traceability across all audits**, including how status and applicability changed
   over time.
5. **Offline-first.** No network calls at any point during normal operation.
6. **Dead-simple UX.** Auditors see Export and Import. All log, merge, and hash mechanics
   stay invisible.

### Device constraints

The device fleet cannot be dictated — iPad, Android tablets, Windows and Mac laptops are
all in play. This rules out any approach requiring installation, and rules out the File
System Access API (unsupported on Safari/iOS and Firefox).

---

## 2. Non-goals

- **AI hazard detection.** Explicitly out of scope. Assessors are trained HSE personnel who
  identify hazards themselves. `VisualRiskAssessor` remains a separate standalone tool
  producing an addendum report. This tool needs only manual photo attachment.
- **Multi-user server, authentication, RBAC.** Deleted, not hardened.
- **Live sync.** Reconciliation is by file hand-off (email, USB, AirDrop).
- **Cryptographic non-repudiation.** See §7 for the honest limits of what is provided.

---

## 3. Findings from the current codebase

Verified against `main` at commit `d71f683`.

| Finding | Location | Consequence |
|---|---|---|
| Sites nested inside projects, keyed by mutable display names | `dataManagement.js`, `projectManagement.js` | A site cannot belong to two projects. Many-to-many is impossible without a data-model rebuild. |
| Re-auditing overwrites scores in place | `projectManagement.js` (`selectSite`, `addNewProject`) | Zero audit history exists today. |
| Rename = delete-key / insert-key | `projectManagement.js:34-42`, `:62-71` | Any future foreign-key relation breaks silently on rename. |
| Questions identified by their text string | `{name, score, comment}` throughout | Rewording a question orphans all its history. |
| Import fully replaces state | `importAllAuditData()` | No merge path for multiple auditors. |
| Score items have no evidence field | `{name, score, comment}` | Photo attachment is additive. |
| Express/JWT/bcrypt/Render/Railway/Docker layer | `server.js`, `apiClient.js`, deploy configs | Contradicts local-only goal. To be deleted. |
| Unescaped `innerHTML` and `document.write` in report path | `uiManagement.js`, `reportGeneration.js` | XSS risk; matters because merged files are semi-trusted input and reports get shared. |

---

## 4. Architecture

An **event-sourced log** is the single source of truth. All current state — site lists,
phase statuses, applicable questions, scores, dashboards — is *derived* by replaying the
log into in-memory projections. Nothing is stored as separately-mutated state.

```
          ┌──────────────────────────────────┐
          │   Event log (append-only)         │  ← authoritative
          │   hash-chained per device         │
          └───────────────┬──────────────────┘
                          │ replay once on load,
                          │ update incrementally
                          ▼
          ┌──────────────────────────────────┐
          │   Projections (in memory)         │
          │   sites · projects · assignments  │
          │   phase trees · active question   │
          │   sets · visit history · scores   │
          └───────────────┬──────────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
        Dashboards / UI            Reports
```

**Photos are not in the replay path.** At runtime they live in a separate IndexedDB object
store keyed by `photoId`; events reference the ID plus a content hash. Replaying hundreds
of visits never touches image bytes. On export they are inlined so the file stays
self-contained.

### Why event sourcing rather than a join-table refactor

It is doing three jobs at once, each of which was independently required:

1. **Evidence.** Immutability and attribution fall out of the model rather than being
   bolted on.
2. **Merge.** Union of events by ID is correct, order-independent and idempotent. A mutable
   entity model would need per-field conflict resolution across auditors' devices.
3. **Traceability of change.** Status trajectories and applicability changes are recorded
   for free, which is exactly what §1.4 requires and what a snapshot model loses.

---

## 5. Data model

### 5.1 Entities

**Site** — a physical location in a global registry. Exists independently of any project.
Fields: `siteId`, `name`, `location`, `notes`.

**Project** — a scope-of-work engagement. Fields: `projectId`, `name`, `client`,
`leadAuditor`, `projectDirector`, `subPhasesEnabled` (chosen at project setup; when false
the phase tree is capped at one level below the assignment).

**Assignment** — the project × site join, carrying its own attributes. This is the fat join
that makes concurrent scope-differentiated work representable: Site X can run
"Earthmoving & Foundation" under Project A while simultaneously running "Cable Laying &
Instrumentation" under Project B, each with independent phases, statuses and audit history.
Fields: `assignmentId`, `projectId`, `siteId`, `scopeName`, `startDate`, `endDate`.

**Phase** — a node in the assignment's phase tree, to a maximum depth of three levels
(assignment → phase → sub-phase). Fields: `phaseId`, `assignmentId`, `parentPhaseId`,
`name`, `statusId`.

**AuditVisit** — one auditor's completed, finalized visit. Immutable once recorded.

All entities carry stable generated IDs. Names are display attributes and may change freely
without breaking any relation.

### 5.2 Status vocabulary

Statuses are an editable, ordered list, not a hardcoded enum, so labels can match each
client's terminology:

```js
[ { statusId, label, order, isTerminal } ]
```

Default: Not Started (0) → Active (1) → Complete (2, terminal) → Handed Over (3, terminal).

All rollup logic keys off `order` and `isTerminal`. It never references label text.

### 5.3 Status rollup

A parent phase's status is **computed, never set directly**. This implements the
requirement that a handed-over part can sit inside a still-in-progress larger stage.

- **Leaf phase:** its own explicitly-set status.
- **Parent with children:** the **lowest-ordered status among its children**, computed
  bottom-up so nested sub-phases resolve first.
- An assignment's overall status is the rollup of its top-level phases. An assignment with
  no phases carries an explicitly-set status.

This single rule is vocabulary-agnostic — it never references a status by label — and
produces every required behavior:

| Children | Parent | Why it is right |
|---|---|---|
| all Handed Over (3) | Handed Over (3) | nothing outstanding |
| Complete (2) + Handed Over (3) | Complete (2) | not fully handed over yet |
| **Active (1) + Handed Over (3)** | **Active (1)** | **a handed-over part inside a still-in-progress larger stage** |
| all Not Started (0) | Not Started (0) | nothing begun |

Setting a status directly on a parent that has children is rejected by the UI.

### 5.4 Score calculation

Preserved from current behavior to keep historical comparisons valid:

- Score 0 ("Not Applicable / Not Observed") is excluded from all averages.
- `averageScore = totalScore / ratedItemsCount`; `percentage = (averageScore / 5) * 100`.
- Ratings: `> 90` Excellent, `> 80` Good, `> 70` Satisfactory, `> 50` Low, `≤ 50`
  Unacceptable.

Note: boundaries are strict, so exactly 90.0% rates Good, not Excellent. This is existing
behavior and is preserved deliberately rather than corrected, so that migrated historical
scores do not shift band.

---

## 6. Event types

Every event shares an envelope:

```js
{ eventId, type, ts, deviceId, actor, prevHash, hash, payload }
```

`prevHash` chains to the previous event **from the same `deviceId`**, so independently
working tablets each maintain their own verifiable chain and merging never invalidates one.

| Event | Payload |
|---|---|
| `site_created` | `siteId, name, location` |
| `site_updated` | `siteId, changedFields` |
| `project_created` | `projectId, name, client, leadAuditor, projectDirector, subPhasesEnabled` |
| `project_updated` | `projectId, changedFields` |
| `assignment_created` | `assignmentId, projectId, siteId, scopeName, startDate` |
| `assignment_updated` | `assignmentId, changedFields` |
| `phase_added` | `phaseId, assignmentId, parentPhaseId, name` |
| `phase_updated` | `phaseId, name` |
| `phase_status_changed` | `phaseId, statusId, note` |
| `phase_removed` | `phaseId, reason` |
| `question_activated` | `assignmentId, target {type: section\|question, id}, phaseId` |
| `question_closed` | `assignmentId, target, reason` |
| `question_reopened` | `assignmentId, target, reason` |
| `adhoc_question_created` | `questionId, assignmentId, sectionId, text` |
| `adhoc_question_promoted` | `questionId, catalogueVersionId` |
| `catalogue_updated` | `catalogueVersionId, changes` |
| `status_vocabulary_updated` | `statuses[]` |
| `audit_visit` | see §6.1 |
| `audit_correction` | `correctionId, correctsVisitId, reason, items[]` |

### 6.1 `audit_visit`

```js
{
  visitId, assignmentId,
  auditType: "management" | "site",
  date, auditorName,
  phasesCovered: [phaseId],
  catalogueVersionId,
  items: [
    { questionId, sectionId,
      textAsShown,           // fidelity: what the auditor actually read
      score, comment,
      photos: [ { photoId, contentHash, caption } ] }
  ]
}
```

`textAsShown` is stored alongside `questionId` deliberately. The ID links a question across
time for trend analysis; the stored text proves what was actually put to the auditee even
if the catalogue is reworded years later.

### 6.2 Drafts versus events

Work in progress is a **draft**, held in IndexedDB and autosaved on every change. A draft is
mutable, is not part of the event log, and is not authoritative. Pressing **Finalize**
emits one immutable `audit_visit` event.

There is at most one draft per `(assignmentId, auditType)`.

Corrections to a finalized visit never edit it. They emit an `audit_correction` event
referencing the original, and both appear in the record. Reports show the corrected values
with the original visible on drill-down.

### 6.3 Management System Audit scope

The Management System Audit is recorded per assignment, not per project. A project whose
sites carry very different scopes can therefore hold different management-system answers
per site. Where answers are genuinely uniform, the UI offers "copy from another assignment
in this project" as a convenience — which emits a normal `audit_visit`, so the copy is
recorded as its own attributable event rather than a shared reference.

---

## 7. File format, merge, and tamper-evidence

### 7.1 File format

One pretty-printed JSON file. Human-skimmable at the top, authoritative log below.

```js
{
  "formatVersion": "2.0.0",
  "generatedAt": "2026-08-27T14:00:00Z",
  "generator": "OHS Audit Tool 3.0.0",
  "index": { "projects": [...], "sites": [...], "assignments": [...] },
  "statusVocabulary": [...],
  "catalogue": { "versions": [...] },
  "events": [ ... ],
  "photos": { "<photoId>": "data:image/jpeg;base64,..." },
  "chainHeads": { "<deviceId>": "<hash>" }
}
```

`index` is a **derived convenience cache**, regenerated on every export and never read as
authoritative. If it disagrees with the event log, the log wins and the index is rebuilt.

`photos` is a top-level map rather than inline blobs inside each event. This deduplicates
images referenced more than once, keeps the events section readable, and mirrors the
runtime IndexedDB layout. The file remains fully self-contained — export leaves nothing
behind.

Photos are downscaled client-side before storage: longest edge 1600px, JPEG quality 0.7.

`formatVersion` follows semver and gates future migrations.

### 7.2 Merge

Merge is a union of events by `eventId`:

- Importing the same file twice changes nothing (idempotent).
- Import order does not affect the result (commutative).
- Photos merge by `photoId`, with `contentHash` verified on arrival.
- Two events sharing an `eventId` but differing in content is an integrity failure. The
  import is rejected and reported; it is never silently resolved.
- After merge, every device chain is re-verified.

Because auditors work on different assignments, merge is overwhelmingly union rather than
conflict resolution. The conflict path exists to detect corruption and tampering, not as a
routine workflow.

### 7.3 Tamper-evidence, and its limits

Each event carries `hash = SHA-256(canonicalJSON(envelope-without-hash))`, where photo bytes
are represented by their `contentHash` rather than included directly — so verifying a chain
never requires rehydrating images.

This detects: post-hoc edits to recorded audits, deletion of events from the middle of a
chain, reordering, and swapped photos.

**It is explicitly not cryptographic non-repudiation.** There are no per-auditor private
keys, so anyone with the file and the tool could in principle rebuild a whole chain from
scratch. It raises tampering from "trivial and invisible" to "requires deliberate effort and
tooling", which is proportionate for internal dispute defence. If formally evidentiary use
is ever required, per-auditor signing keys are the upgrade path, and the envelope has room
for a `signature` field.

This limitation must be stated plainly in user-facing documentation. It must not be
described to clients as "tamper-proof".

### 7.4 Hashing implementation

`crypto.subtle.digest` is used where available. Availability of Web Crypto on `file://`
origins varies by browser and **must be verified on all four target platforms during
implementation**. A ~100-line pure-JS SHA-256 fallback ships alongside it so the design has
no single point of failure on an unverified platform assumption.

---

## 8. Question lifecycle

The applicable question set is not static — it tracks physical reality on site. Once a
permanent roof is cast and the temporary structure struck, temporary-works questions become
irrelevant and close; other questions arise.

**Closure is forward-only.** This is the rule that protects the evidence chain. If a
question scored 2 in March and closes in June, the March record keeps that 2 permanently.
Closure affects only which questions appear on *subsequent* visits. Past `audit_visit`
events are immutable and already carry their own snapshot of what was asked.

**Questions go live** either automatically when a phase activates (bringing that phase's
default set, via `appliesToPhases` on the catalogue section) or by explicit auditor action.

**Closure requires a reason.** "Why did you stop auditing temporary structures?" is exactly
what gets challenged in a dispute, so `question_closed` records who, when, and why —
*"permanent roof cast and load-bearing, temporary structure struck 12 June"*. This converts
a gap in the record into a defensible justification.

**Closure is not terminal.** Temporary works can return for a later phase; `question_reopened`
exists for that.

**Closure can target a section or a single question.** The event stores the intent — "Temporary
Works Safety section closed" — rather than dissolving into unrelated per-question closures,
which reads far better in a report.

**Ad-hoc questions.** An auditor facing an unlisted hazard can add a question on the spot. It
is marked `adHoc: true` and scoped to that assignment only, so cross-site comparability is
visibly protected. The lead consultant can later promote a good one into the master
catalogue via `adhoc_question_promoted`, after which it behaves as a standard question.

### 8.1 Consequence for trend analysis

Once the question set changes over time, overall-score trends stop being comparable — 45
questions in March against 38 in June, with a different mix. A naive chart reports
improvement that is really composition change.

Therefore:

- Trend views compare **like-for-like on the intersection** of questions live in both periods.
- Points where the question set changed are **visibly marked** on the chart.
- Headline percentages carry a footnote whenever composition shifted between compared periods.

Producing quietly misleading evidence is the worst available failure mode for this tool, so
this behavior is a requirement, not a refinement.

---

## 9. UI flow

**Selection.** Pick a project, then a site within it — the site list filters to sites
actually assigned to that project, and the header displays the assignment's `scopeName`, so
"Site X / Cable Laying" is unambiguous when the same site also runs civils under another
project.

**Tabs.** Dashboard · Audit · Phases · History · Reports · Settings.

- **Audit** merges the former Management System and Site Performance tabs into one screen
  with a toggle, since both now hang off the assignment. Only questions live for currently
  active phases are shown.
- **Phases** presents the phase tree with status controls and rollup display.
- **History** lists finalized visits for the assignment, with corrections shown against
  their originals.
- **Settings** holds the site registry, projects, catalogue management, status vocabulary,
  and the Export / Import buttons.

**Field ergonomics.** The 0–5 score `<select>` is replaced with a six-button segmented
control — dropdowns are poor on a tablet and worse with gloves. Each question carries a
camera button capturing straight to the item. Every change autosaves to IndexedDB; there is
no save button to forget under field pressure.

**Auditor-facing surface** is Export and Import only. Log, merge, and hash mechanics are
never surfaced.

---

## 10. Reports

All reports are computed by replaying and filtering the event log. None are stored.

**Scopes:**

- Single assignment (one site under one project).
- Project-wide (all assignments under a project).
- **Site-wide across all projects** — every engagement at one physical site regardless of
  project. This is new, impossible in the current model, and is the clearest safety picture
  of a shared site.
- Assignment comparison.
- Progress over time for one assignment.

**Content:** inline photos, the phase status tree, and the closed-question log with reasons,
so the record explains its own gaps rather than appearing to have holes. Trend sections
carry the §8.1 composition markers.

**Output:** HTML export and print-to-PDF, as today. `document.write` is replaced with
escaped DOM construction, closing the injection hole flagged in the superseded security plan.

**Verification block:** each report embeds event count, chain head hashes, and generation
timestamp, so a printed report can be checked back against the file it came from.

---

## 11. Migration

### 11.1 Data

On first load, if legacy `ohsAuditToolData` is present in localStorage, offer a one-time
import:

- Each project name becomes a Project with a generated ID.
- Each site name becomes a Site — **deduplicated by name across projects**. Where the same
  site name appears under two projects, it collapses into one Site with two Assignments.
  This is where the many-to-many relationship appears retroactively.
- Each project/site pair becomes an Assignment with `scopeName` defaulted to the project
  name, editable afterwards.
- `masterConfig` becomes catalogue version 1, with generated stable question IDs.
- Current scores become one `audit_visit` per assignment, flagged `migrated: true` with
  `dateApproximate: true`, dated from the legacy `lastSaved` timestamp.

The approximate-date flag is required. Asserting a precise audit date that was never
recorded would poison the evidence record from day one, and migrated visits must be
visibly distinguishable from genuine field records in every report.

Legacy localStorage data is left in place after migration, not cleared, until the user
confirms the result.

### 11.2 Code

**Delete:** `server.js`, `public/js/apiClient.js`, the auth modal in `index.html`,
`Dockerfile`, `docker-compose.yml`, `render.yaml`, `railway.json`, all `DEPLOYMENT_*.md`,
`RENDER_DEPLOYMENT.md`, `QUICK_DEPLOY_RENDER.md`, `START_HERE.md`, `ENVIRONMENT_VARIABLES.md`,
`MVP_GAP_SECURITY_PLAN.md`, `.env.example`, `tests/api.test.js`, the `.playwright-cli/`
dumps, and Vite starter leftovers (`counter.js`, `javascript.svg`, `vite-starter-main.js`,
`test_report_functions.html`, duplicate `style.css` / `styles.css`).

**Drop dependencies:** express, jsonwebtoken, bcryptjs, cors, helmet, express-rate-limit,
bytes, supertest.

**Keep:** vite, chart.js. **Add:** vite-plugin-singlefile.

**Rewrite:** `dataManagement.js` → `eventStore.js` + `projections.js` + `merge.js` +
`hashChain.js`. `projectManagement.js` → `entities.js` + `assignments.js` + `phases.js`.

**Port onto projections:** `uiManagement.js`, `chartManagement.js`, `reportGeneration.js`,
`recommendations.js`, `comparison-chart-extension.js`, `questionEvaluation.js` — these are
adapted to read projections rather than `project.sites[siteName]`, not rewritten.

**Fix throughout:** escape all interpolated values; no unescaped `innerHTML` with
user-controlled content.

Work proceeds on a branch. `main` is left untouched until parity is demonstrated.

### 11.3 Build

`vite-plugin-singlefile` produces one self-contained HTML file (~1–2 MB with Chart.js
inlined).

The build **must emit a classic script, not an ES module** (`rollupOptions.output.format:
'iife'` with `inlineDynamicImports`). ES module scripts and dynamic imports are unreliable
from `file://` origins. Opening the built file directly from the filesystem on all four
target platforms is an explicit acceptance test, not an assumption.

---

## 12. Testing

The valuable logic is pure functions, testable without a browser using `node --test`
(already present; no new dependency).

**Unit:**

- Replay determinism — same events in any order produce identical projections.
- Merge idempotence — importing the same file twice changes nothing.
- Merge union — two auditors' files combine correctly.
- Merge conflict — same `eventId` with different content is rejected, not resolved.
- Hash chain — detects edits, deletions, and reordering.
- Status rollup — terminal child with an active sibling keeps the parent active; all-terminal
  children yield the lowest-ordered terminal status.
- Forward-only closure — closing a question leaves past visits unaltered.
- Trend like-for-like — composition change is detected and marked.
- Score calculation — score 0 excluded; band boundaries behave as specified in §5.4.
- Migration — legacy fixture produces the expected entities, with same-named sites across
  projects collapsing to one Site with two Assignments.

**Manual checklist** (not worth automating at this size): photo capture on each target
device, export/import round-trip between two devices, print output fidelity, and opening the
built file from `file://` on iPad Safari, Android Chrome, Windows, and Mac.

---

## 13. Deferred — explicitly out of scope for v1

These are decisions to exclude, not open questions:

- Per-auditor cryptographic signing keys (§7.3 upgrade path).
- Live sync or any networked reconciliation.
- Playwright end-to-end suite — the manual checklist covers v1.
- Promotion of the tool to multi-tenant or hosted use.
- Integration with `VisualRiskAssessor`, which stays a separate addendum tool.

---

## 14. Approval and sequencing

Design agreed in brainstorming across two conversation branches, 2026-08-27. Implementation
planning follows via the writing-plans skill once this document is reviewed.

This design is too large for a single implementation pass. The plan should sequence it as:

1. **Core** — event store, hash chain, projections, merge. Pure logic, fully unit-tested,
   no UI. Nothing else is trustworthy until this is.
2. **Migration** — legacy import onto the core, verified against a real exported fixture
   from the current tool.
3. **Audit capture** — assignment/phase management, the audit screen, photos, finalize.
4. **Reports and dashboards** — ported onto projections.
5. **Single-file build and cross-device acceptance** — including the `file://` test on all
   four target platforms (§11.3), which is a gate, not a formality.

Each stage should be usable and testable before the next begins.
