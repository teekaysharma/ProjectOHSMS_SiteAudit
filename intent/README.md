# Intent home

Every change to this tool starts here, following the AI-native SDLC loop
(https://claude.com/blog/the-ai-native-sdlc-playbook). Each change gets one folder,
`NNNN-short-slug/`, and each stage commits one artifact the next stage reads.

| Artifact | Written by | Accepted by | Starts |
|---|---|---|---|
| `intent.md` | Originator, drafted with Claude from `TEMPLATE.md` | Product owner | Spec |
| `spec.md` | Claude, from the accepted intent | Product owner | Plan |
| `plan.md` + `plans/*.md` | Claude in plan mode (superpowers `writing-plans`) | Engineer | Build |
| Diff and tests | Claude (superpowers TDD) | Code owner, via PR against `REVIEW.md` | Merge |

Rules:

- Nothing is implemented without an accepted plan. Acceptance is the merge of the PR
  that carries the artifact, or a `Status: accepted` line committed by the owner.
- When implementation departs from a plan, the plan is updated in the same commit.
- This folder is the source of truth for specs and plans. It replaces the superpowers
  default locations (`docs/superpowers/specs/`, `docs/superpowers/plans/`).
- Git history is the audit trail: who asked, what was produced, who accepted it.

| ID | Change | Intent | Spec | Plan |
|---|---|---|---|---|
| 0001 | Local-first rearchitecture | draft | awaiting approval | stage 0 executed; stages 1 to 5 not yet planned |
