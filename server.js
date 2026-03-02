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

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const DATA_DIR = path.join(__dirname, 'server-data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.log.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify({ masterConfig:{management:{},site:{}}, inspectionData:{projects:{},currentProject:''}, version:'1.0', updatedAt:new Date().toISOString() }, null, 2));
if (!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, '[]');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
function writeJson(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
function logAudit(entry) {
  const logs = readJson(AUDIT_FILE);
  logs.push({ id: Date.now(), ts: new Date().toISOString(), ...entry });
  writeJson(AUDIT_FILE, logs.slice(-5000));
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ohs-mvp-api' }));

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) return res.status(400).json({ error: 'Invalid email/password' });
  const users = readJson(USERS_FILE);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const role = users.length === 0 ? 'admin' : 'auditor';
  users.push({ email, passwordHash: hash, role, createdAt: new Date().toISOString() });
  writeJson(USERS_FILE, users);
  logAudit({ actor: email, action: 'register', role });
  res.json({ ok: true, role });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const users = readJson(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  logAudit({ actor: user.email, action: 'login' });
  res.json({ token, user: { email: user.email, role: user.role } });
});

app.get('/api/state', auth, (req, res) => {
  res.json(readJson(STATE_FILE));
});

app.put('/api/state', auth, (req, res) => {
  const state = req.body || {};
  if (!state.masterConfig || !state.inspectionData) return res.status(400).json({ error: 'Invalid state payload' });
  state.updatedAt = new Date().toISOString();
  writeJson(STATE_FILE, state);
  logAudit({ actor: req.user.email, action: 'state_update' });
  res.json({ ok: true, updatedAt: state.updatedAt });
});

app.get('/api/audit-logs', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  res.json(readJson(AUDIT_FILE));
});

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`OHS MVP API/server running on http://localhost:${PORT}`);
});
