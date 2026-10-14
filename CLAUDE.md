# OHSMS Site Audit

Offline OHS audit tool for field HSE auditors. The legacy app at the repo root is being
replaced by a single-file, local-first app in `app/`. Before changing `app/`, read the
change folder in `intent/` the work belongs to: `intent.md`, `spec.md`, `plan.md`.

## Commands
- Install: `npm ci`
- Test: `npm test` (healthy output ends with `# fail 0`)
- Build legacy app: `npm run build` (writes `dist/`; merges to `main` publish it to GitHub Pages)
- Build new app: `npm run build:app` (writes one file, `dist-app/index.html`)

Before reporting any task done, run test, build and build:app, and paste the output.
If a test fails, fix the code, not the test.

## How work flows
Follows the AI-native SDLC playbook (claude.com/blog/the-ai-native-sdlc-playbook):
`intent.md` and `brd.md` (why), then `spec.md` and `prd.md` (what), owner accepts each;
then `plans/*.md` (engineer accepts), then code and tests, then a PR reviewed against
`REVIEW.md`. Artifacts live in `intent/NNNN-slug/`, not `docs/superpowers/`. Never
implement without an accepted plan; if work departs from it, update it in the same commit.

Everything is saved in this repo: commit, push and open PRs here. Never write deliverables
to Google Drive or a local Windows path. No config or links for other AI build platforms;
keep what they taught as repo docs (see `docs/legacy-app-notes.md`).

## How to work
`.claude/settings.json` loads the superpowers and Karpathy guidelines plugins. Use both.
- Superpowers: `brainstorming` before design; `writing-plans` for plans;
  `using-git-worktrees` to isolate; `test-driven-development` for all code;
  `systematic-debugging` for failures; `subagent-driven-development` to run a plan;
  `requesting-code-review` before a PR; `verification-before-completion` before "done".
- Karpathy: think before coding (state assumptions, ask); simplicity first; surgical
  changes (touch only the task); goal-driven (write the check, watch it fail, then pass).
- Principles: YAGNI; DRY at the third repeat; one reason per commit; root cause first.

## Architecture
- `app/`: the new app (spec §11.2): `app/src/core/` (event store, hash chain, projections,
  merge; pure, no DOM), `app/src/domain/` (entities, phases, catalogue), `app/src/ui/`.
  Folders appear when a plan creates them.
- `vite.app.config.js` builds `app/` into one HTML file with a classic IIFE script.
- Legacy app: `index.html`, `main.js`, `public/js/`, `server.js`. Frozen except for fixes
  the owner asks for; removed at parity.
- `docs/salvage/`: source material, imported verbatim. A hook blocks edits.
- `docs/sources/`: verbatim text extracts of public codes and regulations. Never edit them;
  no ISO or other licensed text goes here (see its README).
- `tests/`: `node --test`, listed file by file in the `package.json` test script.

## Safety posture
Reports from this tool inform decisions about work that can injure or kill people. The
worst failure is not a crash; it is a plausible report that is wrong (spec C7 to C14).
- Never add a default, fallback or rounding that changes what a report says. Fail loudly.
- Every number that reaches a report or dashboard has a test, including band boundaries.
- Question text and its technical limits are content, not code. Never edit them.
- Open safety decisions (spec C1 to C14) are not yours to settle. Do not build around them.

## Rules that protect the evidence
- The event log is append-only. Corrections are new events; nothing edits or deletes a
  finalized event.
- Bands (spec §5.4): `> 90` Excellent, `> 80` Good, `> 70` Satisfactory, `> 50` Low, else
  Unacceptable. Strict `>` on the unrounded percentage. Never "fix" them.
- Score 0 is excluded from every average.
- No network calls at runtime. No new runtime dependency without asking the owner.
- Never put user or imported text into `innerHTML` or `document.write`. Build DOM nodes.
- Records are tamper-evident, never "tamper-proof", in code, UI text and docs.

## Things Claude gets wrong
- `vite-plugin-singlefile` with `removeViteModuleLoader: true` empties the script when the
  output format is `iife`. Leave it off; `vite.app.config.js` handles the script tag.
- The salvage hook only catches Edit and Write. Do not route around it with shell commands.
