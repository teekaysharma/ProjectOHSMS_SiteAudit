# Plan: 0001 local-first rearchitecture

**Intent:** [`intent.md`](./intent.md) · **Spec:** [`spec.md`](./spec.md) (awaiting approval)

Stages follow spec §14, with a Stage 0 added for scaffolding. Each stage gets its own plan
in `plans/`, written with superpowers `writing-plans` once the previous stage has merged,
and each stage ends usable and tested before the next begins.

| Stage | Scope | Plan | Status |
|---|---|---|---|
| 0 | Scaffold: Claude Code config, single-file build, test harness | [`plans/0-scaffold.md`](./plans/0-scaffold.md) | Executed 2026-09-24, in PR |
| 1 | Core: event store, hash chain, projections, merge (pure logic, no UI) | Not written | Waits on spec acceptance |
| 2 | Catalogue v1 with build-time stable IDs, legacy config importer | Not written | Needs concern C4 resolved |
| 3 | Audit capture: assignments, phases, audit screen, photos, finalize | Not written | |
| 4 | Reports and dashboards, ported onto projections | Not written | Concern C5 applies |
| 5 | Cross-device acceptance, including `file://` on all four platforms | Not written | Build started in Stage 0; C1 proposes an earlier device check |

Stage 0 needs no design decision from the spec. It adds tooling beside the legacy app and
changes none of the legacy app's files (spec §11.2: `main` untouched until parity).
