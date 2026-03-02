import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../server.js';

function mkTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ohs-mvp-test-'));
}

test('health endpoint works', async () => {
  const app = createApp({ dataDir: mkTmpDir(), staticDir: null, jwtSecret: 'test-secret' });
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test('register/login/state/audit flow works', async () => {
  const app = createApp({ dataDir: mkTmpDir(), staticDir: null, jwtSecret: 'test-secret' });

  const register = await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin@test.local', password: 'Password123!' });
  assert.equal(register.status, 200);
  assert.equal(register.body.role, 'admin');

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.local', password: 'Password123!' });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  const token = login.body.token;

  const state = await request(app)
    .get('/api/state')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(state.status, 200);
  assert.ok(state.body.masterConfig);

  const put = await request(app)
    .put('/api/state')
    .set('Authorization', `Bearer ${token}`)
    .send({ masterConfig: { management: {}, site: {} }, inspectionData: { projects: {}, currentProject: '' } });
  assert.equal(put.status, 200);
  assert.equal(put.body.ok, true);

  const logs = await request(app)
    .get('/api/audit-logs')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(logs.status, 200);
  assert.ok(Array.isArray(logs.body));
  assert.ok(logs.body.length >= 2);
});
