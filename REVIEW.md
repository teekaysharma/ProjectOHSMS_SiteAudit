# Review instructions

Review each PR against its change folder in `intent/NNNN-slug/` (`spec.md` and the stage
plan in `plans/`) and against `CLAUDE.md`.

## Passes
Run three passes and tag each finding with its pass:
- Bugs: logic errors, broken edge cases, regressions in the legacy app or its Pages build.
- Security: user or imported text reaching `innerHTML` or `document.write` unescaped, any
  runtime network call, secrets in the diff.
- Compliance: the diff matches the spec and the stage plan. A changed file the plan does
  not name is a finding. A test weakened, skipped or deleted is a finding.

## What Important means here
Reserve Important for findings that would:
- alter or lose a finalized audit record, or let a change escape the hash chain;
- change a performance band or its strict comparison, or band a rounded percentage;
- make a report claim something the record does not support (trend composition, unsigned
  visits, closed questions);
- stop the built file opening from `file://`, add a second output file, or emit an ES
  module script;
- reword or renumber salvaged questions.
Style and naming are nits.

## Cap the nits
Report at most five nits per review; summarise the rest as a count.

## Do not report
- `package-lock.json` contents, or anything CI already enforces (`npm audit`, build, tests).
- Style in legacy files (`index.html`, `main.js`, `public/js/`) the PR does not change.
