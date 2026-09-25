# Plan: 0001 local-first rearchitecture

**Intent:** [`intent.md`](./intent.md) · **Spec:** [`spec.md`](./spec.md) (awaiting approval)

Stages follow spec §14, with a Stage 0 added for scaffolding. Each stage gets its own plan
in `plans/`, written with superpowers `writing-plans` once the previous stage has merged,
and each stage ends usable and tested before the next begins.

| Stage | Scope | Plan | Status |
|---|---|---|---|
| 0 | Scaffold: Claude Code config, single-file build, test harness | [`plans/0-scaffold.md`](./plans/0-scaffold.md) | Executed 2026-09-24, in PR |
| 1 | Event store, hash chain, merge (pure logic, no UI) | [`plans/1-core-event-foundation.md`](./plans/1-core-event-foundation.md) | Built and reconciled 2026-09-25 from a desktop-session branch predating this process (see the plan's Provenance section) |
| 1b | Projections: entities, phase tree and rollup, question applicability, visits, scoring and banding versions | Not written | The other half of spec §14 Stage 1. Deliberately split out of Task 1-6's scope (see Stage 1's plan, "Not in this plan"); waits on spec acceptance since it touches C6 to C9 (catalogue and scoring content) |
| 2 | Catalogue v1 with build-time stable IDs, legacy config importer | Not written | Needs concern C4 resolved |
| 3 | Audit capture: assignments, phases, audit screen, photos, finalize | Not written | |
| 4 | Reports and dashboards, ported onto projections | Not written | Concern C5 applies |
| 5 | Cross-device acceptance, including `file://` on all four platforms | Not written | Build started in Stage 0; C1 proposes an earlier device check |

Stage 0 needs no design decision from the spec. It adds tooling beside the legacy app and
changes none of the legacy app's files (spec §11.2: `main` untouched until parity).

Stage 1 is pure event-sourcing infrastructure — hashing, event identity, the append-only log,
and merge — and touches no scoring, banding, or catalogue content, so it does not depend on
how C1 to C14 are resolved. It closes spec concern C2 (see the plan's Rulings).
