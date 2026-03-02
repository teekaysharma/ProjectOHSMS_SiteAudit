(function() {
  // API Base URL configuration
  // - Production: defaults to same origin (empty string)
  // - Development: uses localhost:3000 or value from VITE_API_BASE_URL env var
  const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const BASE_URL = window.__API_BASE_URL__ ||
    (isDev ? 'http://localhost:3000' : '');
  const TOKEN_KEY = 'ohs_auth_token';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  async function request(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  }

  async function health() {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async function register(email, password) {
    return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async function login(email, password) {
    const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(data.token);
    return data;
  }

  async function loadState() { return request('/api/state'); }
  async function saveState(state) { return request('/api/state', { method: 'PUT', body: JSON.stringify(state) }); }
  async function getAuditLogs() { return request('/api/audit-logs'); }

  window.apiClient = { health, register, login, loadState, saveState, getAuditLogs, getToken, clearToken };
})();
