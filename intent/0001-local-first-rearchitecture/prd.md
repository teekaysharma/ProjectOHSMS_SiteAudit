# PRD: local-first OHSMS site audit tool

Change ID: 0001. Status: draft, awaiting owner acceptance.
Date: 2026-10-14. Drafted by Claude from `intent.md` and `spec.md`; nothing here is new
scope. Where this PRD and `spec.md` differ, `spec.md` wins and this PRD is corrected.
Business case: [`brd.md`](./brd.md). Design: [`spec.md`](./spec.md). Stages: [`plan.md`](./plan.md).

Origin: the requirements come from a need for a tool that retains and compares audit data
across multiple projects and multiple sites. A site can sit under several projects and a
project can hold several sites (many-to-many). Further requirements will come from field
use; each is raised as a new change under `intent/`.

This PRD says what the product must do and how we know it did. It does not settle the
open safety decisions C1 to C14 in `spec.md`. Requirements that depend on one are marked
"blocked by Cn" and are not built until the owner decides.

## 1. Product summary

One HTML file that a field HSE auditor opens from local storage on an iPad, Android
tablet, Windows laptop or Mac and uses fully offline. Each finalized audit is an
append-only, hash-chained record. Auditors exchange files and the tool merges them
without conflicts. Reports show history, compare trends like-for-like, and state why a
question stopped being audited.

## 2. Users

| User | Does | Needs |
|---|---|---|
| Field HSE auditor | Records a site visit on a tablet, often with gloves, with no signal | Fast capture, autosave, photos, Export and Import only |
| Lead consultant | Merges auditors' files, issues reports, manages catalogue and banding | Merge that cannot lose or reorder records; reports that explain their gaps |
| Report recipient (client, contractor, third party) | Reads or disputes a report | A report that states what it covers, what it does not, and how to check it |
| Product owner | Accepts intent, spec, safety decisions | Visible open decisions; no silent scope change |

## 3. Goals and non-goals

Goals, in the order the spec ranks them (spec §1): no platform lock-in; evidence-grade
records; many-to-many projects and sites; traceability across all audits; offline-first;
dead-simple UX.

Non-goals (spec §2 and §13): AI hazard detection; server, login or roles; live sync;
cryptographic non-repudiation; per-auditor signing keys; third-party timestamping;
legacy data migration; an end-to-end browser suite; hosted or multi-tenant use;
integration with VisualRiskAssessor.

## 4. Functional requirements

Each has an ID, the spec section it comes from, and the check that proves it. "Stage" is
the plan stage that delivers it (`plan.md`).

### 4.1 Records and merge (stage 1, built)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-01 | Every change is an event in an append-only log. Nothing edits or deletes a finalized event; corrections are new events. | §4, §6 | Unit: chain detects edit, deletion, reorder |
| FR-02 | Events are hash-chained per device. Hashing is synchronous pure-JS SHA-256 on every platform. | §6, §7.4 | Unit: published vectors, padding boundaries, UTF-8, fuzz |
| FR-03 | Merging is a union by event ID. It is order-independent and idempotent. Same ID with different content is rejected, not resolved. | §7.2 | Unit: either order same result; double import changes nothing; conflict rejected |
| FR-04 | Current state is derived by replay. Same events in any order give identical projections. | §4 | Unit: replay determinism |

### 4.2 Entities and phases (stage 1b)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-05 | Sites, projects and assignments have stable generated IDs. Names are display text and can change without breaking relations. | §5.1 | Unit: rename keeps all relations |
| FR-06 | Many-to-many: a site can belong to several projects at once and a project can hold several sites. Each project and site pairing is an assignment with its own scope, phases and history. | §5.1 | Unit: one site in two projects, one project with two sites, independent state |
| FR-06a | Audit data is retained per assignment and can be compared across assignments, projects and sites. | §10 | Unit: assignment comparison and site-wide report |
| FR-07 | Phases nest to three levels. A parent's status is the lowest-ordered status among its children and cannot be set directly. | §5.3 | Unit: the four rollup cases |
| FR-08 | The status list is editable and ordered. Rollup uses order and terminal flag, never label text. | §5.2 | Unit: relabelled vocabulary gives same rollup |

### 4.3 Scoring and banding (stage 1b; blocked by C7, C8 for display rules)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-09 | Percentage is average of rated items divided by 5, times 100. Score 0 is excluded from every average. | §5.4 | Unit: zero excluded |
| FR-10 | Bands use strict `>` on the unrounded percentage: over 90 Excellent, over 80 Good, over 70 Satisfactory, over 50 Low, else Unacceptable. Exactly 90.0 is Good. | §5.4 | Unit: every boundary, both sides |
| FR-11 | Custom banding is possible only behind a warning. It is versioned; each visit stores the banding version in force and reports render under that version. | §5.4, §5.4.1 | Unit: v1 visit keeps v1 band after v2 exists |
| FR-12 | Whether and how a score is shown beside open Major non-conformances, coverage and Not Applicable versus Not Observed. | C7, C8 | Blocked: owner decision |

### 4.4 Catalogue and question lifecycle (stage 2)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-13 | The 208 salvaged questions are imported verbatim with build-time stable IDs. No rewording, no renumbering. Re-import does not duplicate. | §11.1 | Unit: fixture import, double import |
| FR-14 | Questions go live with a phase or by auditor action. Closing needs a reason and is forward-only; past visits keep their own snapshot. Closed questions can reopen. | §8 | Unit: past visit unchanged after close |
| FR-15 | An auditor can add an ad-hoc question scoped to one assignment. A lead can promote it into the catalogue. | §8 | Unit: scope and promotion |
| FR-16 | Catalogue content is signed off by a named competent person before field use. | C9 | Blocked: owner decision on reviewer |
| FR-17 | Each question can carry its audit criterion (document, version, clause). | C13 | Blocked: owner decision |

### 4.5 Audit capture (stage 3)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-18 | Scores are entered with a six-button segmented control. Every change autosaves; there is no save button. | §9 | Manual: tablet with gloves |
| FR-19 | A photo attaches to a question from the camera. Photos stay out of the replay path and are inlined on export. | §4, §9 | Manual: capture on each device; unit: hash reference |
| FR-20 | Finalize shows a summary and a warning that the visit becomes permanent and can only be amended by a visible correction. A signature is optional. | §6.1, §9 | Manual and unit |
| FR-21 | Altering any score in a signed visit invalidates the chain, so a signature never appears to cover findings it did not. | §6.1.1 | Unit: signature binding |
| FR-22 | The Management System Audit is recorded per assignment, with copy from another assignment. | §6.3, C6 | Blocked: owner confirms C6 |
| FR-23 | Drafts are held outside the event log until finalized. | §6.2 | Unit |
| FR-24 | Device date and time are shown for the auditor to confirm at Finalize. | C10 | Blocked: owner decision on scope |
| FR-25 | Non-conformance follow-up (action, owner, due date, close-out). | C11 | Blocked: owner decision |

### 4.6 Reports and dashboards (stage 4)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-26 | Reports are computed by replay and never stored. Scopes: one assignment, a project, a site across all projects, assignment comparison, progress over time. | §10 | Unit and manual |
| FR-27 | Trends compare only questions live in both periods. Composition changes are marked on the chart and footnoted on headline percentages. | §8.1 | Unit: like-for-like |
| FR-28 | Reports show closed questions with reasons, and say plainly when a visit is unsigned. | §10 | Unit |
| FR-29 | A band is computed in one function from the unrounded percentage. The legacy report's separate four-band colouring is not carried forward. | C5 | Unit: 80.0 rates Satisfactory everywhere |
| FR-30 | Every report carries a verification block (event count, chain head hashes, time) and a disclaimer that cannot be suppressed. | §10, §10.1 | Unit; wording blocked by C3 |
| FR-31 | Report HTML is built from escaped DOM nodes. User and imported text never reaches `innerHTML` or `document.write`. | §10 | Unit: hostile import fixture |

### 4.7 Delivery (stage 0 built; stage 5)

| ID | Requirement | Spec | Check |
|---|---|---|---|
| FR-32 | `npm run build:app` writes exactly one file, `dist-app/index.html`, with a classic script that opens from `file://`. | §11.3 | Build check |
| FR-33 | The hosted backend, login and their dependencies are removed at parity. | §3, §11.2 | Review against `REVIEW.md` |
| FR-34 | A record survives closing and reopening the browser on iPad Safari, Android Chrome, Windows and Mac. | C1, §12 | Manual, on a real device |
| FR-35 | A file exported today imports in five years: the tool never deletes a record, and every export states its `formatVersion`. | C14 | Blocked: owner decision; a test per format |

## 5. Non-functional requirements

| ID | Requirement | Source |
|---|---|---|
| NFR-01 | No network call at runtime. | spec §1, CLAUDE.md |
| NFR-02 | No new runtime dependency without owner approval. | CLAUDE.md |
| NFR-03 | Runs on iPad, Android tablet, Windows and Mac with no install. File System Access API is not required. | spec §1 |
| NFR-04 | Records are described as tamper-evident, never tamper-proof, in code, UI and docs. Protection against the consultancy's own staff is out of scope. | spec §7.3 |
| NFR-05 | Auditors see Export and Import only. Log, merge and hash mechanics stay hidden. | spec §9 |
| NFR-06 | Every number that reaches a report or dashboard has a test, band boundaries included. | CLAUDE.md |
| NFR-07 | Failures are loud. No default, fallback or rounding may change what a report says. | CLAUDE.md |
| NFR-08 | Performance targets (open time, replay time at N events, photo size). | Not set. Solo field use will show what is needed; until then the stage 1 behaviour is the baseline. |

## 6. Release plan

Follows `plan.md`. Each stage is usable and tested before the next starts.

| Stage | Delivers | Requirements | State |
|---|---|---|---|
| 0 | Scaffold, single-file build, test harness | FR-32 | Built |
| 1 | Event store, hash chain, merge | FR-01 to FR-04 | Built, merged (PR #30) |
| 1b | Projections, entities, phases, scoring, banding | FR-05 to FR-11 | Not planned; waits on spec acceptance |
| 2 | Catalogue v1, legacy config importer | FR-13 to FR-17 | Not planned; needs C4 |
| 3 | Audit capture | FR-18 to FR-25 | Not planned |
| 4 | Reports and dashboards | FR-26 to FR-31 | Not planned; C5 applies |
| 5 | Cross-device acceptance, legacy removal | FR-33 to FR-35 | Not planned |

## 7. Success measures

Taken from `intent.md` "Success looks like". Each is a pass or fail check, not a target
rate.

1. An auditor completes a visit on an iPad offline and the record is there after the
   browser is closed and reopened (FR-34).
2. Two auditors' files merged in either order give the same result; importing one file
   twice changes nothing (FR-03).
3. Changing a finalized score after signing is detectable (FR-01, FR-21).
4. A report explains its own gaps: closed questions carry reasons, unsigned visits are
   stated (FR-28).

## 8. Open items

| Item | Who | Affects |
|---|---|---|
| Accept or correct `intent.md` and `spec.md` | Owner | Everything after stage 1 |
| Decide C1 to C14 | Owner | FR-12, FR-16, FR-17, FR-22, FR-24, FR-25, FR-35 |
| Disclaimer wording reconciled with VisualRiskAssessor (C3) | Owner | FR-30 |
| Section-to-phase mapping (C4) | Owner | Stage 2 |
| Performance targets for NFR-08 | Owner, after field use | Stage 3 onward |
| Real-device test of IndexedDB persistence (C1) | Device test | FR-34 |

## 9. Traceability

Each FR names its spec section. Each stage plan in `plans/` must name the FR it delivers
and the test that proves it. A requirement with no test is not done.
