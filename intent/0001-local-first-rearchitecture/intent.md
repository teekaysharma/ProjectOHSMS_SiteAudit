# Intent: local-first OHSMS site audit tool

Author: Tapas Kumar Sharma (owner). Drafted by Claude on 2026-09-24 from the design
decisions recorded in `spec.md` (brainstormed 2026-08-27). Owner to correct before acceptance.
Status: draft.
Change ID: 0001

## Problem

Field HSE auditors record management-system and site audits on construction projects.
The current tool cannot hold those records to the standard the work needs:

- Re-auditing a site overwrites the previous scores. No audit history exists.
- A site belongs to one project only and is keyed by its display name, so a site running
  two scopes of work under two projects cannot be represented.
- Questions are identified by their text. Rewording a question orphans its history.
- Importing a file replaces all data, so two auditors' work cannot be combined.
- It carries a hosted backend (Express, JWT, Render/Railway configs), which contradicts
  the goal of no platform lock-in.
- The report path builds HTML without escaping, so an imported file can inject content
  into a shared report.

Audit records are used in disputes on construction sites. A record that can change
silently, or that loses its history, does not hold up.

## Proposed outcome

One HTML file that an auditor opens from local storage on a tablet or laptop and uses
fully offline. Every finalized audit is kept as an append-only, hash-chained record.
Auditors exchange files (shared folder, USB, email) and the tool merges them without
conflicts. Reports show history, compare trends like-for-like, and state why any question
stopped being audited.

## Affected users and systems

- Field HSE auditors on iPad, Android tablets, Windows and Mac laptops.
- The lead consultant who consolidates auditors' files and issues reports.
- Clients, contractors and third parties who receive or dispute reports.
- This repository: the legacy app (`index.html`, `main.js`, `public/js/`) is replaced, and
  the Express server, auth modal and their dependencies are removed.
- VisualRiskAssessor, a separate tool whose report disclaimer must not contradict this one.

## Constraints

- No hosted backend, no platform lock-in, no network calls during normal use.
- Runs on devices the owner cannot dictate, with no installation. The File System Access
  API cannot be a requirement (unsupported on Safari/iOS and Firefox).
- Records are tamper-evident against outsiders. Protection against the consultancy's own
  staff is out of scope (decided 2026-08-27). Records are never described as tamper-proof.
- Performance bands stay as set on expert advice: `> 90` Excellent, `> 80` Good, `> 70`
  Satisfactory, `> 50` Low, `<= 50` Unacceptable, strict comparison. Consultants may
  define their own, behind a warning, versioned so past audits keep their original band.
- The 208 salvaged audit questions (`docs/salvage/questionlist.json`) are imported
  verbatim: no rewording, no renumbering.
- Auditors see Export and Import only. Log, merge and hash mechanics stay hidden.
- No AI hazard detection in this tool.

## Success looks like

- An auditor completes a site visit on an iPad with no connection, and the record is
  still there after the browser is closed and reopened.
- Two auditors' files merged in either order give the same result, and importing the same
  file twice changes nothing.
- Changing a finalized score after signing is detectable.
- A report explains its own gaps: closed questions carry their reasons, unsigned visits
  are stated as unsigned.

## Open questions

- Final disclaimer wording, reconciled with VisualRiskAssessor (spec §10.1). Owner.
- Section-to-phase mapping derived from salvaged material needs confirming
  (`docs/salvage/README.md`). Owner.
- Whether data held in IndexedDB persists for a file opened from local storage on iPad
  Safari. Not verified. See spec concern C1. Device test.
- Whether Web Crypto is available from `file://` on all four platforms. Not verified; the
  spec plans a pure-JS fallback (§7.4). Device test.
- Management System Audit per assignment (spec §6.3) reverses the earlier project-level
  behaviour the owner asked for. Confirm the change (spec concern C6). Owner.
- Safety decisions C7 to C11 (spec): open Major NCs hidden by averages, Not Applicable
  versus Not Observed, competent-person review of question content, device clock, and
  corrective action follow-up. Owner, with the references in `docs/references.md`.
