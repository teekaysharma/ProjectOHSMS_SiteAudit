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
