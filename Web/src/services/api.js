// ─── Centralised API service ─────────────────────────────────
// All HTTP calls to the backend go through this module.
// The JWT token is automatically attached to every authenticated request.
// Uses Vite proxy → requests go to /api/* which proxies to localhost:3000

const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('mx_token');
}

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
  // Backend wraps responses in { success, data } — unwrap automatically
  return data.data !== undefined ? data.data : data;
}

// AUTH
export const authAPI = {
  register: (name, email, password, captchaAnswer, captchaExpected) => {
    const parts = name.trim().split(' ');
    const first_name = parts[0] || 'Usuario';
    const last_name = parts.slice(1).join(' ') || 'N/A';
    
    return request('POST', '/auth/register', { 
      first_name, 
      last_name, 
      email, 
      password,
      phone_number: '0000000000',
      body_type: 'MESOMORFO',
      birth_date: '2000-01-01T00:00:00.000Z',
      captchaAnswer, 
      captchaExpected 
    }, false);
  },
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }, false),
  me: () => request('GET', '/users/me'),
  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }, false),
  resetPassword: (token, password) =>
    request('POST', '/auth/reset-password', { token, password }, false),
};

// EXERCISES
export const exercisesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request('GET', `/exercises${params ? '?' + params : ''}`);
  },
  create: (data) => request('POST', '/exercises', data),
  update: (id, data) => request('PUT', `/exercises/${id}`, data),
  delete: (id) => request('DELETE', `/exercises/${id}`),
  toggleFavorite: (id) => request('POST', `/exercises/${id}/favorite`),
};

// ROUTINES
export const routinesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request('GET', `/routines${params ? '?' + params : ''}`);
  },
  create: (data) => request('POST', '/routines', data),
  update: (id, data) => request('PUT', `/routines/${id}`, data),
  delete: (id) => request('DELETE', `/routines/${id}`),
  toggleFavorite: (id) => request('POST', `/routines/${id}/favorite`),
};

// PROFILE
export const profileAPI = {
  get: () => request('GET', '/users/me'),
  save: (data) => request('PUT', '/users/me', data),
};

// ADMIN
export const adminAPI = {
  getUsers: () => request('GET', '/users'),
};

// RESTRICTIONS (from backend catalog)
export const restrictionsAPI = {
  getAll: () => request('GET', '/restrictions'),
};

// MUSCLES
export const musclesAPI = {
  getAll: () => request('GET', '/muscles'),
};

// AI
export const aiAPI = {
  getChurnPrediction: () => request('GET', '/ai/churn-prediction'),
  checkOverexertion: (userId, proposedVolume, proposedHr) =>
    request('POST', `/ai/overexertion-check/${userId}`, { proposed_volume: proposedVolume, proposed_hr: proposedHr }),
  getBiometricAnomalies: () => request('GET', '/ai/biometric-anomalies'),
  getAssociationRules: () => request('GET', '/ai/association-rules'),
};
