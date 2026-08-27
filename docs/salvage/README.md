# Salvaged content

Material rescued from branches and sibling repositories **before** they are deleted, so that
nothing of value is lost in the cleanup. Recovered 2026-08-27.

Nothing here is wired into the application yet. It is source material for catalogue v1 as
described in §11.1 of the design spec.

## `questionlist.json` — the important one

**From:** branch `origin/boltsupported`, repo `teekaysharma/ProjectOHSMS_SiteAudit`.

**Contents:** 208 audit questions — 104 management across 13 sections, 104 site across 14
sections — numbered in proper audit style (`1.1`, `1.2`, …) and containing UAE/ADOSH-specific
material (mandatory heat stress management, HV equipment installation, testing and
commissioning, final handover).

This is the single most valuable artefact recovered. `main` carries only 30 generic
placeholder questions hardcoded in `loadDefaultTemplate()`; this is real professional
content and should become **catalogue version 1**.

Do not paraphrase, renumber, or "improve" the question text when importing it. It is
domain work product, and the numbering is referenced in audit practice.

## `PhaseSelector.js.reference` — the phase list

**From:** `teekaysharma/hse-ai-db`, path `HVSAudit/js/components/PhaseSelector.js`.

A 325-line prototype titled "HV Substation Safety Audit Tool" that independently arrived at
phase-filtered audit sections — the same idea as §8 of the design spec, built earlier and
abandoned. Its section-to-phase mapping was never populated (`HVSAudit.html` is a 21-line
skeleton), so there is no mapping data to recover, only the phase list itself:

| Phase | id |
|---|---|
| Site Preparation | `site-prep` |
| Civil Works | `civil-works` |
| Equipment Installation | `equipment-install` |
| Electrical Installation | `electrical-install` |
| Testing & Commissioning | `testing-comm` |
| Final Handover | `final-handover` |

**Why this matters:** these six phases map almost one-to-one onto the site sections in
`questionlist.json` above:

| Phase | Maps to site section |
|---|---|
| Site Preparation | 2. Site Preparation & Temporary Works Safety |
| Civil Works | 3. Excavation & Civil Works Safety |
| Equipment Installation | 4. Construction Equipment & Mobile Plant · 7. HV Equipment Installation |
| Electrical Installation | 8. Electrical Installation & Connections |
| Testing & Commissioning | 9. Testing & Commissioning Safety Procedures |
| Final Handover | 14. Final Handover & Documentation |

The remaining sections (1. Permits, 5. Access & Traffic, 6. Signage, 10. Heat Stress,
11. Operator Competency, 12. PPE, 13. Emergency Response) apply across all phases and should
carry an empty `appliesToPhases`, meaning always applicable — exactly the distinction §8 of
the spec requires.

**So the section-to-phase binding does not need to be invented.** It is derivable from these
two salvaged artefacts, and should be confirmed with the user rather than assumed.

**`hse-ai-db` is being kept**, not deleted (decided 2026-08-27). It is becoming a searchable
repository of HSE reference information — a separate project from this tool. The copy here
is still a useful local record of where the phase model came from, but it is no longer the
only surviving copy.

**Licence note:** `hse-ai-db` is GPLv3; this repository is MIT. The file is kept here as
`.reference` and is *not* compiled into the build. Only the phase *names* — facts, not code —
are carried forward. The user authored both repositories and can relicense his own work, but
no GPL code should be copied into this MIT codebase without that being made explicit.

## `defaulttemplate.json` — low value

**From:** branch `origin/boltsupported`.

An 8-question stub, superseded entirely by `questionlist.json`. Retained only so the
salvage record is complete. Not intended for use.
