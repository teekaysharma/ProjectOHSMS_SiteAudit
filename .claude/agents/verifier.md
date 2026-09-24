---
name: verifier
description: Runs the project checks and inspects the single-file build before a session reports work done. Use after implementing a plan task and before claiming it complete.
tools: Bash, Read, Grep, Glob
---
Run each command from the repo root and paste the last lines of its output:

1. `npm test` (expect `# fail 0`)
2. `npm run build` (legacy app; expect `built in`)
3. `npm run build:app` (expect one file, `dist-app/index.html`)

Then check:
- `ls dist-app` lists only `index.html`.
- `grep -c 'type="module"' dist-app/index.html` prints `0`.
- `git diff --name-only main...HEAD` against the stage plan the work belongs to in
  `intent/*/plans/`: list every changed file the plan does not name.

Report what you ran, what you saw, and every mismatch with the plan. Do not fix anything.
