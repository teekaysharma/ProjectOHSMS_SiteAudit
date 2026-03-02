import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureStorage(dataDir) {
  const usersFile = path.join(dataDir, 'users.json');
  const stateFile = path.join(dataDir, 'state.json');
  const auditFile = path.join(dataDir, 'audit.log.json');

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(
      stateFile,
      JSON.stringify(
        {
          masterConfig: { management: {}, site: {} },
          inspectionData: { projects: {}, currentProject: '' },
          version: '1.0',
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
  }
  if (!fs.existsSync(auditFile)) fs.writeFileSync(auditFile, '[]');

  return { usersFile, stateFile, auditFile };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function createApp(options = {}) {
  const app = express();
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET || 'change-me-in-production';
  const dataDir = options.dataDir || process.env.DATA_DIR || path.join(__dirname, 'server-data');
  const staticDir = options.staticDir === undefined ? path.join(__dirname, 'dist') : options.staticDir;

  const { usersFile, stateFile, auditFile } = ensureStorage(dataDir);

  const logAudit = (entry) => {
    const logs = readJson(auditFile);
    logs.push({ id: Date.now(), ts: new Date().toISOString(), ...entry });
    writeJson(auditFile, logs.slice(-5000));
  };

  const auth = (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
      req.user = jwt.verify(token, jwtSecret);
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ohs-mvp-api' }));

  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Invalid email/password' });
    }

    const users = readJson(usersFile);
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'User exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const role = users.length === 0 ? 'admin' : 'auditor';
    users.push({ email, passwordHash: hash, role, createdAt: new Date().toISOString() });
    writeJson(usersFile, users);
    logAudit({ actor: email, action: 'register', role });

    return res.json({ ok: true, role });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    const users = readJson(usersFile);
    const user = users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email, role: user.role }, jwtSecret, { expiresIn: '12h' });
    logAudit({ actor: user.email, action: 'login' });

    return res.json({ token, user: { email: user.email, role: user.role } });
  });

  app.get('/api/state', auth, (_req, res) => {
    res.json(readJson(stateFile));
  });

  app.put('/api/state', auth, (req, res) => {
    const state = req.body || {};
    if (!state.masterConfig || !state.inspectionData) {
      return res.status(400).json({ error: 'Invalid state payload' });
    }

    state.updatedAt = new Date().toISOString();
    writeJson(stateFile, state);
    logAudit({ actor: req.user.email, action: 'state_update' });

    return res.json({ ok: true, updatedAt: state.updatedAt });
  });

  app.get('/api/audit-logs', auth, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    return res.json(readJson(auditFile));
  });

  if (staticDir && fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  return app;
}

export function startServer(options = {}) {
  const app = createApp(options);
  const port = options.port || process.env.PORT || 3000;
  return app.listen(port, () => {
    console.log(`OHS MVP API/server running on http://localhost:${port}`);
  });
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  startServer();
}
