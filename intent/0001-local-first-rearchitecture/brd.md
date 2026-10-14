# BRD: local-first OHSMS site audit tool

Change ID: 0001. Status: draft, awaiting owner input and acceptance.
Date: 2026-10-14. Drafted by Claude from `intent.md`, `spec.md` and `docs/legacy-app-notes.md`.
Product requirements: [`prd.md`](./prd.md).

This BRD states the business need. It is built from what the repo records plus the owner's
statements of 2026-10-14. Where neither says anything (budget, timeline, volumes), the
BRD says none is set. No figure here is an estimate.

## 1. Purpose

Give the consultancy's field HSE auditors a tool that produces audit records good enough
to stand up in a dispute on a construction site, without depending on a hosted platform
or a network connection.

## 2. Business problem

Evidence from `intent.md` and `spec.md` §3:

- Re-auditing a site overwrites earlier scores, so no audit history exists.
- A site belongs to one project only and is keyed by display name, so two concurrent
  scopes at one site cannot be represented.
- Questions are identified by their text, so rewording orphans their history.
- Importing a file replaces all data, so two auditors' work cannot be combined.
- A hosted backend (Express, JWT, Render/Railway) contradicts the goal of no platform
  lock-in.
- The report path builds HTML without escaping, so an imported file can inject content
  into a shared report.

The consequence is business risk: a record that changes silently or loses history does
not hold up when a client, contractor or authority challenges it. The tool's output
informs decisions about work that can injure or kill people, so a plausible but wrong
report is the worst failure (`CLAUDE.md`, spec C7 to C14).

## 3. Business objectives

| ID | Objective | Measure |
|---|---|---|
| BO-1 | Audit records that withstand dispute | Changing a finalized score after signing is detectable (PRD FR-01, FR-21) |
| BO-2 | No dependency on any hosting platform | No server, no runtime network call (NFR-01, FR-33) |
| BO-3 | Work in the field on any device the fleet has | Runs from `file://` on iPad, Android, Windows, Mac (FR-32, FR-34) |
| BO-4 | Several auditors can work on one engagement and combine results | Merge in either order gives one result (FR-03) |
| BO-5 | Reports that explain themselves | Closed questions carry reasons; unsigned visits are stated (FR-28) |
| BO-6 | Records stay readable for the retention period | A file exported today imports in five years (FR-35, C14) |

## 4. Stakeholders

| Stakeholder | Interest | Role in this change |
|---|---|---|
| Tapas Kumar Sharma (owner) | Defensible audits; no lock-in | Accepts intent, spec, safety decisions |
| Field HSE auditors | Fast, offline capture | Users |
| Lead consultant | Merge, reports, catalogue and banding | User and reviewer |
| Clients, contractors, third parties | Receive or dispute reports | Report recipients |
| Competent person for catalogue content | Technical limits in question text | Reviewer, to be named (C9) |
| Engineer / code owner | Accepts plans, reviews PRs | Delivery |
| Regulators and standards bodies (ADPHC, ADOSH-SF, ISO 19011, ISO 45001) | Source of audit criteria | External; cited by clause (`docs/references.md`) |

This is a solo project (owner's statement, 2026-10-14). The owner is sponsor, approver
and the primary user. There is no separate sponsor or approval chain.

## 5. Scope

In scope: the single-file local-first app in `app/`, the catalogue import, reports and
dashboards, and removal of the hosted layer from the legacy app at parity.

Out of scope: AI hazard detection; server, login, roles; live sync; cryptographic
non-repudiation; hosted or multi-tenant use; integration with VisualRiskAssessor; legacy
data migration (nothing to migrate). Source: spec §2, §13.

## 6. Business requirements

| ID | Requirement | Objective | PRD |
|---|---|---|---|
| BR-1 | Finalized audit records are append-only and hash-chained. Corrections are new records. | BO-1 | FR-01 to FR-04, FR-21 |
| BR-2 | Records are described as tamper-evident against outsiders, never tamper-proof. Insider protection is out of scope. | BO-1 | NFR-04 |
| BR-3 | The tool runs with no installation and no network. | BO-2, BO-3 | NFR-01, NFR-03, FR-32 |
| BR-4 | One site can carry concurrent engagements under different projects. | BO-4 | FR-05, FR-06 |
| BR-5 | Auditors' files merge without loss, in any order, any number of times. | BO-4 | FR-03 |
| BR-6 | Performance bands stay as set on expert advice, with strict comparison, applied to the unrounded percentage. Custom bands are versioned and never rewrite past audits. | BO-1 | FR-09 to FR-11, FR-29 |
| BR-7 | Trends compare like with like and mark changes in the question set. | BO-5 | FR-27 |
| BR-8 | Every report carries a non-removable disclaimer and a verification block. | BO-1, BO-5 | FR-30 |
| BR-9 | The 208 salvaged questions are used verbatim. Technical limits in them are reviewed by a competent person before field use. | BO-1 | FR-13, FR-16 |
| BR-10 | Records are kept at least five years and old export formats stay importable. | BO-6 | FR-35 |

BR-6 and the Excellent-with-open-Major-non-conformance problem (C7) pull in different
directions. The owner decides how a band is shown beside open Major non-conformances;
this BRD does not.

## 7. Benefits

Qualitative only, from `intent.md`:

- A disputed audit can be answered from the record, with history and reasons.
- No recurring hosting dependency or vendor lock-in.
- Auditors work on whatever device they carry, with no connection.
- One physical site's safety picture can be read across every project at it.
- A reasonably assured audit of construction sites and projects by qualified auditors,
  which helps hold a high safety standard on site (owner's statement, 2026-10-14).
- Audit data kept and compared across many projects and many sites, where each site can
  sit under several projects and each project can have several sites.

No quantified benefit (hours saved, disputes avoided, cost avoided) is claimed. The owner
has not set one; the benefit is assurance, not a cost saving.

## 8. Constraints

- Regulatory and technical sources are cited by clause. ISO standards, ADIBC 2013 and the
  UAE Fire and Life Safety Code 2018 are not reproduced (licence).
- File System Access API cannot be required.
- No new runtime dependency without owner approval.
- Question text and technical limits are content, not code.
- Open safety decisions C1 to C14 belong to the owner.

## 9. Assumptions

- Auditors exchange files by shared folder, USB, email or AirDrop (spec §7.2.1). Inferred
  from the spec; not tested with users.
- IndexedDB data survives closing the browser for a page opened from local storage on
  iPad Safari. **Not verified** (C1). If false, BO-3 fails on iPad.
- Threat model is outsiders only (decided 2026-08-27).

## 10. Dependencies

| Dependency | Needed for | State |
|---|---|---|
| Owner acceptance of `intent.md` and `spec.md` | Everything after stage 1 | Open |
| Decisions C1 to C14 | Stages 1b to 5 | Open |
| Named competent person for catalogue review | Field use | Open |
| Disclaimer wording, reconciled with VisualRiskAssessor | Stage 4 | Open |
| Real iPad, Android, Windows and Mac devices | Stage 5 | Owner to confirm which devices are available |

## 11. Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Plausible but wrong report | Decisions on site made on bad data | Tests on every reported number; open safety concerns not built around |
| Catalogue text carries wrong technical limits (C9) | Unsafe item scores as conforming | Competent-person sign-off before field use |
| Average hides an open Major non-conformance (C7) | Excellent band beside a fatal hazard | Owner decision on display rules |
| iPad cannot persist local data (C1) | Loss of records in the field | Device test at end of stage 1 |
| Clock on tablet is wrong (C10) | Wrong date on evidence | Owner decision on confirmation step |
| Records described as stronger than they are | Misplaced trust | Tamper-evident wording rule (BR-2) |
| History in commit `527985f` holds a fire-code extract | Licence exposure | Purge needs a force-push; owner's instruction only |

## 12. Success criteria

The four checks in `prd.md` §7. The change is a business success when the owner accepts
the spec, C1 to C14 are each decided or carried forward in writing, and stage 5 passes on
all four platforms.

## 13. Timeline, budget, approvals

- **Timeline:** none set. Stage order is in `plan.md`.
- **Budget:** none set. Solo project.
- **Approvals:** the owner accepts each artifact (`intent/README.md`).
- **Change control:** new or changed requirements come from using the tool in the field
  (owner's statement, 2026-10-14). Each becomes a new `intent/NNNN-slug/` change, so the
  chain in `CLAUDE.md` applies to it. Field feedback does not edit an accepted artifact
  in place.
