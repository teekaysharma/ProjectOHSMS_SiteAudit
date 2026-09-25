# Stage 0: Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the rearchitecture a working skeleton: Claude Code configuration that loads the agreed skills and guards salvaged content, a build that turns `app/` into one offline HTML file, and tests that pin both.

**Architecture:** The new app lives in `app/` beside the untouched legacy app. A second Vite config (`vite.app.config.js`) builds it with `vite-plugin-singlefile` into `dist-app/index.html`, then a small post-build plugin rewrites the inlined module script into a classic script at the end of `<body>`. Agent configuration lives in `.claude/`, `CLAUDE.md` and `REVIEW.md`.

**Tech Stack:** Node 20+ (`node --test`), Vite 7, vite-plugin-singlefile 2.3.3, Claude Code plugins (superpowers 6.4.1, andrej-karpathy-skills 1.0.0).

**Spec:** [`../spec.md`](../spec.md) (§11.2 code, §11.3 build, §12 testing, §13 deferred)

## Global Constraints

- "The deliverable is one HTML file that runs from local storage on a tablet or laptop." (§1)
- "No network calls at any point during normal operation." (§1)
- "The build **must emit a classic script, not an ES module** (`rollupOptions.output.format: 'iife'` with `inlineDynamicImports`)." (§11.3)
- "**Keep:** vite, chart.js. **Add:** vite-plugin-singlefile." (§11.2)
- "Work proceeds on a branch. `main` is left untouched until parity is demonstrated." (§11.2) Stage 0 changes no legacy app file.
- Tests use `node --test` "(already present; no new dependency)" (§12). Playwright end-to-end suite is deferred (§13): no Playwright dependency.

## Review Focus

1. Opening `dist-app/index.html` from `file://` on iPad Safari, Android Chrome, Windows and Mac: the page should render. Only desktop Chromium is checked here (Task 2, Step 7); the other three stay on the §12 manual checklist.
2. A dependency upgrade that makes the build emit `type="module"`, a dynamic import, or a second file: the build test must fail. Pinned in Task 2 tests, and the plugin version is exact.
3. An edit to salvaged content given a relative or Windows-style path: the hook must block it. Pinned in Task 1 tests.
4. The legacy `npm run build` and its GitHub Pages output: must behave exactly as before. Checked in Task 2, Step 8.
5. CI runs Node 20 while this session runs Node 22: the test script lists files explicitly instead of relying on newer `--test` globbing.

---

### Task 1: Claude Code configuration and salvage guard

**Files:**
- Create: `tests/hooks.test.js`
- Create: `.claude/hooks/protect-salvage.mjs`
- Create: `.claude/settings.json`
- Modify: `package.json` (`scripts.test`)

**Interfaces:**
- Consumes: nothing.
- Produces: hook contract. Reads the PreToolUse JSON on stdin; exits `2` with a stderr reason when `tool_input.file_path` or `tool_input.notebook_path` lies under `docs/salvage/`, otherwise exits `0`.

- [x] **Step 1: Write the failing test**

`tests/hooks.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOOK = fileURLToPath(new URL('../.claude/hooks/protect-salvage.mjs', import.meta.url));

function runHook(toolInput) {
  return spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name: 'Edit', tool_input: toolInput }),
    encoding: 'utf8'
  });
}

test('blocks an edit to the salvaged question list', () => {
  const result = runHook({ file_path: '/repo/docs/salvage/questionlist.json' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /verbatim/);
});

test('blocks a relative path into docs/salvage', () => {
  assert.equal(runHook({ file_path: 'docs/salvage/README.md' }).status, 2);
});

test('blocks a Windows-style path into docs\\salvage', () => {
  assert.equal(runHook({ file_path: 'C:\\repo\\docs\\salvage\\questionlist.json' }).status, 2);
});

test('allows an edit outside docs/salvage', () => {
  assert.equal(runHook({ file_path: '/repo/app/src/main.js' }).status, 0);
});

test('allows a tool call with no file path', () => {
  assert.equal(runHook({}).status, 0);
});
```

- [x] **Step 2: Run it to verify it fails**

Run: `node --test tests/hooks.test.js`
Expected: FAIL. Every test fails because the hook file does not exist (`Cannot find module`, status 1).

- [x] **Step 3: Write the hook**

`.claude/hooks/protect-salvage.mjs`:

```js
// PreToolUse guard. Salvaged audit content is imported verbatim (spec §11.1), so Claude
// may not edit anything under docs/salvage/. Exit code 2 blocks the tool call and shows
// stderr to Claude.
let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  const toolInput = JSON.parse(raw || '{}').tool_input ?? {};
  const path = toolInput.file_path ?? toolInput.notebook_path ?? '';
  if (('/' + path.replace(/\\/g, '/')).includes('/docs/salvage/')) {
    process.stderr.write(
      `Blocked: ${path} is salvaged source material and stays verbatim (spec §11.1). ` +
      'Ask the owner before changing it.\n'
    );
    process.exit(2);
  }
});
```

- [x] **Step 4: Run it to verify it passes**

Run: `node --test tests/hooks.test.js`
Expected: PASS, `# pass 5`, `# fail 0`.

- [x] **Step 5: Add the hook to the test script**

In `package.json`, change `"test"` to:

```json
"test": "node --test tests/api.test.js tests/hooks.test.js"
```

Run: `npm test`
Expected: `# pass 7`, `# fail 0` (2 legacy API tests + 5 hook tests).

- [x] **Step 6: Register plugins and the hook**

Register the marketplaces and plugins with the CLI so the settings shape is the one Claude Code writes itself:

```bash
claude plugin marketplace add multica-ai/andrej-karpathy-skills --scope project
claude plugin install andrej-karpathy-skills@karpathy-skills --scope project
claude plugin marketplace add obra/superpowers-marketplace --scope project
claude plugin install superpowers@superpowers-marketplace --scope project
```

Then add `permissions` and `hooks` so `.claude/settings.json` reads exactly:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm ci)",
      "Bash(npm test)",
      "Bash(npm run build)",
      "Bash(npm run build:app)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/protect-salvage.mjs\""
          }
        ]
      }
    ]
  },
  "enabledPlugins": {
    "andrej-karpathy-skills@karpathy-skills": true,
    "superpowers@superpowers-marketplace": true
  },
  "extraKnownMarketplaces": {
    "karpathy-skills": {
      "source": { "source": "github", "repo": "multica-ai/andrej-karpathy-skills" }
    },
    "superpowers-marketplace": {
      "source": { "source": "github", "repo": "obra/superpowers-marketplace" }
    }
  }
}
```

Verify:

```bash
jq -e '.hooks.PreToolUse[] | select(.matcher == "Edit|Write|NotebookEdit") | .hooks[0].command' .claude/settings.json
echo '{"tool_name":"Edit","tool_input":{"file_path":"docs/salvage/questionlist.json"}}' | CLAUDE_PROJECT_DIR=$PWD sh -c "$(jq -r '.hooks.PreToolUse[0].hooks[0].command' .claude/settings.json)"; echo "exit $?"
claude plugin list
```

Expected: the command string prints; the pipe test prints the `Blocked:` message and `exit 2`; both plugins list as `√ enabled` at project scope.

- [x] **Step 7: Commit**

```bash
git add tests/hooks.test.js .claude/hooks/protect-salvage.mjs .claude/settings.json package.json
git commit -m "chore(claude): enable superpowers and karpathy plugins, guard salvaged content"
```

### Task 2: Single-file build of `app/`

**Files:**
- Create: `tests/app-build.test.js`
- Create: `app/index.html`
- Create: `app/src/main.js`
- Create: `vite.app.config.js`
- Modify: `package.json` (`devDependencies`, `scripts.build:app`, `scripts.test`), `package-lock.json`, `.gitignore`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `npm run build:app` writes exactly one file, `dist-app/index.html`, with one classic inline `<script>` placed after `<main id="app">`. Later stages add modules under `app/src/` and import them from `app/src/main.js`.

- [x] **Step 1: Write the failing test**

`tests/app-build.test.js`:

```js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
let outDir;
let html;

before(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'ohsms-app-'));
  await build({
    configFile: join(repoRoot, 'vite.app.config.js'),
    logLevel: 'silent',
    build: { outDir }
  });
  html = readFileSync(join(outDir, 'index.html'), 'utf8');
});

after(() => rmSync(outDir, { recursive: true, force: true }));

test('build emits exactly one file', () => {
  assert.deepEqual(readdirSync(outDir), ['index.html']);
});

test('script is classic, not an ES module (spec §11.3)', () => {
  assert.doesNotMatch(html, /type="module"/);
  assert.doesNotMatch(html, /\bimport\(/);
});

test('nothing is loaded from another file or the network', () => {
  assert.doesNotMatch(html, /<script[^>]*\bsrc=/);
  assert.doesNotMatch(html, /<link[^>]*\bhref=/);
});

test('app script runs after the mount point exists', () => {
  const mount = html.indexOf('id="app"');
  const script = html.lastIndexOf('<script>');
  assert.ok(mount !== -1, 'mount point missing');
  assert.ok(script > mount, 'script must come after <main id="app">');
});
```

- [x] **Step 2: Run it to verify it fails**

Run: `node --test tests/app-build.test.js`
Expected: FAIL in `before`, because `vite.app.config.js` does not exist.

- [x] **Step 3: Add the dependency**

```bash
npm install -D --save-exact vite-plugin-singlefile@2.3.3
npm audit --audit-level=high
```

Expected: install succeeds; audit exits 0 (CI runs the same gate).

- [x] **Step 4: Write the app shell and build config**

`app/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OHSMS Site Audit</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

`app/src/main.js`:

```js
// Stage 0 placeholder. Stage 3 replaces it with the audit screen.
document.getElementById('app').textContent =
  'OHSMS Site Audit: scaffold build, not for field use.';
```

`vite.app.config.js`:

```js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Spec §11.3: module scripts are unreliable from file://, so the inlined bundle must run
// as a classic script. Vite always tags the entry script type="module" and puts it in
// <head>, where a classic script would run before <main id="app"> exists. This plugin
// runs after vite-plugin-singlefile and moves the inlined code to the end of <body> as a
// plain <script>.
function classicScript() {
  return {
    name: 'classic-script',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset' || !file.fileName.endsWith('.html')) continue;
        const html = String(file.source);
        const match = html.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/);
        if (!match) this.error(`classic-script: no inlined module script in ${file.fileName}`);
        file.source = html
          .replace(match[0], '')
          .replace('</body>', `<script>${match[1]}</script>\n</body>`);
      }
    }
  };
}

export default defineConfig({
  root: 'app',
  base: './',
  // removeViteModuleLoader stays off: with format 'iife' it strips the whole bundle.
  plugins: [viteSingleFile(), classicScript()],
  build: {
    outDir: '../dist-app',
    emptyOutDir: true,
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true }
    }
  }
});
```

In `package.json` `scripts`, add after `"build"`:

```json
"build:app": "vite build --config vite.app.config.js",
```

and change `"test"` to:

```json
"test": "node --test tests/api.test.js tests/hooks.test.js tests/app-build.test.js"
```

In `.gitignore`, under `# Dependencies and build outputs`, add a line `dist-app` after `dist`.

- [x] **Step 5: Run the build test to verify it passes**

Run: `node --test tests/app-build.test.js`
Expected: PASS, `# pass 4`, `# fail 0`.

- [x] **Step 6: Run the full suite and the build**

```bash
npm test
npm run build:app && ls dist-app
```

Expected: `# pass 11`, `# fail 0`; `ls` prints only `index.html`.

- [x] **Step 7: Check it runs from file:// in Chromium**

A local check only; spec §13 keeps Playwright out of the repo. Uses the Playwright installed globally in the Claude Code cloud container:

```bash
node -e '
const { chromium } = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("file://" + process.cwd() + "/dist-app/index.html");
  console.log(JSON.stringify({ text: await page.textContent("#app"), errors }));
  await browser.close();
})();'
```

Expected: `{"text":"OHSMS Site Audit: scaffold build, not for field use.","errors":[]}`

- [x] **Step 8: Confirm the legacy build is unchanged**

Run: `npm run build && ls dist dist/assets`
Expected: `dist/index.html` plus one `.css` and one `.js` in `dist/assets`, as before this plan.

- [x] **Step 9: Commit**

```bash
git add tests/app-build.test.js app vite.app.config.js package.json package-lock.json .gitignore
git commit -m "build(app): single-file offline build of app/ with a classic script"
```

### Task 3: Agent context: CLAUDE.md, REVIEW.md, verifier subagent

**Files:**
- Create: `CLAUDE.md`
- Create: `REVIEW.md`
- Create: `.claude/agents/verifier.md`

**Interfaces:**
- Consumes: the commands from Tasks 1 and 2 (`npm test`, `npm run build`, `npm run build:app`).
- Produces: session context for every later stage, the PR review policy, and a `verifier` subagent.

- [x] **Step 1: Write `CLAUDE.md`**

```markdown
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
`intent.md` (owner accepts), then `spec.md` (owner accepts), then `plans/*.md` (engineer
accepts), then code and tests, then a PR reviewed against `REVIEW.md`. Artifacts live in
`intent/NNNN-slug/`; superpowers specs and plans go there too, not in `docs/superpowers/`.
Never implement without an accepted plan. If the work departs from the plan, update the
plan in the same commit.

## How to work
`.claude/settings.json` loads the superpowers and Karpathy guidelines plugins. In short:
state assumptions and ask when unclear; write the minimum code that passes; touch only
what the task needs; define the check first, watch the test fail, then make it pass.

## Architecture
- `app/`: the new app. Planned layout (spec §11.2): `app/src/core/` (event store, hash
  chain, projections, merge; pure functions, no DOM), `app/src/domain/` (entities,
  assignments, phases, catalogue), `app/src/ui/` (ported views). Folders appear when a
  plan creates them.
- `vite.app.config.js` builds `app/` into one HTML file with a classic IIFE script.
- Legacy app: `index.html`, `main.js`, `public/js/`, `server.js`. Frozen except for fixes
  the owner asks for; removed at parity.
- `docs/salvage/`: source material, imported verbatim. A hook blocks edits.
- `tests/`: `node --test`, listed file by file in the `package.json` test script.

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
```

- [x] **Step 2: Write `REVIEW.md`**

```markdown
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
```

- [x] **Step 3: Write `.claude/agents/verifier.md`**

```markdown
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
```

- [x] **Step 4: Verify every command in CLAUDE.md runs**

```bash
npm ci && npm test && npm run build && npm run build:app && wc -l CLAUDE.md
```

Expected: every command exits 0; `# fail 0`; `CLAUDE.md` under 70 lines (the playbook asks
for under a page).

- [x] **Step 5: Commit**

```bash
git add CLAUDE.md REVIEW.md .claude/agents/verifier.md
git commit -m "docs(claude): add CLAUDE.md, REVIEW.md and verifier subagent"
```

---

## Execution ledger

Executed inline on 2026-09-24 (superpowers `executing-plans`), branch
`claude/gracious-fermat-0gke4a`.

| Task | Commit | Red | Green |
|---|---|---|---|
| 1 | `7fbba75` | 5/5 fail: `Cannot find module .../protect-salvage.mjs` | 5/5 pass; suite 7/7. Live check: an Edit to `docs/salvage/README.md` was blocked by the hook in-session. |
| 2 | `b6d7a5c` | 4/4 fail: `Could not resolve .../vite.app.config.js` | 4/4 pass; suite 11/11. Mutation check: without `classicScript()` tests 2 and 4 fail. Chromium from `file://`: `{"text":"OHSMS Site Audit: scaffold build, not for field use.","errors":[]}`. Legacy `dist/assets` hashes unchanged (`index-Bx5PtHeJ.css`, `index-t93cphkV.js`). `npm audit --audit-level=high` exit 0. |
| 3 | `36d37a8` | n/a (documentation) | `npm ci`, `npm test` (11/11), `npm run build`, `npm run build:app` all exit 0; `CLAUDE.md` 52 lines; `type="module"` count in `dist-app/index.html`: 0. |

Rulings:

- Ruling: Superpowers installs from `obra/superpowers-marketplace`, not
  `claude-plugins-official`. Why: in this container the official marketplace was not
  registered (`Marketplace 'claude-plugins-official' not found`) and the install failed
  twice; Superpowers' README documents its own marketplace as an install route. Cost if
  wrong: none functional; switch the two settings entries to the official marketplace
  once it is reachable.
- Ruling: `removeViteModuleLoader` stays off and a local `classicScript()` plugin does
  the rewrite. Why: a pre-plan spike showed `removeViteModuleLoader: true` with `iife`
  output emits an empty `<script>`. Cost if wrong: one extra 20-line plugin to maintain.
- Ruling: plans and specs live in `intent/NNNN-slug/`, overriding the superpowers
  default `docs/superpowers/`. Why: one home for the playbook artifact chain. Cost if
  wrong: superpowers skills will default to the old folder unless `CLAUDE.md` is read.
- Final whole-branch review: done by the executing session against `REVIEW.md`, not by a
  fresh reviewer subagent (none was requested for this run). A fresh-context review is
  still owed before merge; the managed Code Review or `/code-review` covers it.
