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
