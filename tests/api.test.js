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

test('rejects invalid registration email and malformed state payload', async () => {
  const app = createApp({ dataDir: mkTmpDir(), staticDir: null, jwtSecret: 'test-secret' });

  const badRegister = await request(app)
    .post('/api/auth/register')
    .send({ email: 'not-an-email', password: 'Password123!' });
  assert.equal(badRegister.status, 400);

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin2@test.local', password: 'Password123!' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin2@test.local', password: 'Password123!' });
  const token = login.body.token;

  const badState = await request(app)
    .put('/api/state')
    .set('Authorization', `Bearer ${token}`)
    .send({ masterConfig: {}, inspectionData: {} });
  assert.equal(badState.status, 400);
});

test('non-admin cannot read audit logs', async () => {
  const app = createApp({ dataDir: mkTmpDir(), staticDir: null, jwtSecret: 'test-secret' });

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'owner@test.local', password: 'Password123!' });
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'auditor@test.local', password: 'Password123!' });

  const loginAuditor = await request(app)
    .post('/api/auth/login')
    .send({ email: 'auditor@test.local', password: 'Password123!' });

  const logs = await request(app)
    .get('/api/audit-logs')
    .set('Authorization', `Bearer ${loginAuditor.body.token}`);

  assert.equal(logs.status, 403);
  assert.equal(logs.body.error, 'Admin only');
});
