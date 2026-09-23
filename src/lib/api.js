/**
 * API Wrapper for FastAPI backend
 * Gateway path: http://localhost:8000/api/v1
 */

export const getBaseUrl = () => {
  const customIp = localStorage.getItem('quickfix_custom_api_ip');
  if (customIp && !customIp.includes('localhost') && !customIp.includes('127.0.0.1') && !customIp.startsWith('192.168.') && !customIp.includes('loca.lt')) {
    if (customIp.startsWith('http://') || customIp.startsWith('https://')) {
      const clean = customIp.replace(/\/+$/, '');
      return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
    }
    return `https://${customIp}/api/v1`;
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  return 'https://quickfix-ebly.onrender.com/api/v1';
};

export const getWsUrl = () => {
  const customIp = localStorage.getItem('quickfix_custom_api_ip');
  if (customIp && !customIp.includes('localhost') && !customIp.includes('127.0.0.1') && !customIp.startsWith('192.168.') && !customIp.includes('loca.lt')) {
    if (customIp.startsWith('ws://') || customIp.startsWith('wss://')) {
      return customIp.replace(/\/+$/, '') + '/ws';
    }
    return `wss://${customIp}/ws`;
  }

  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs) {
    const clean = envWs.trim().replace(/\/+$/, '');
    return clean.endsWith('/ws') ? clean : `${clean}/ws`;
  }

  // Derive from VITE_API_URL if available
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi) {
    const withoutApi = envApi.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
    if (withoutApi.startsWith('https://')) {
      return `${withoutApi.replace('https://', 'wss://')}/ws`;
    }
    if (withoutApi.startsWith('http://')) {
      return `${withoutApi.replace('http://', 'ws://')}/ws`;
    }
  }

  return 'wss://quickfix-ebly.onrender.com/ws';
};

const BASE_URL = getBaseUrl();

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('quickfix_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const safeFetch = async (url, options) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('⚠️ Cannot connect to backend (https://quickfix-ebly.onrender.com). Please check your network connection.', { cause: err });
    }
    throw err;
  }
};

export const api = {
  async get(endpoint) {
    return safeFetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  async post(endpoint, body) {
    return safeFetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
  },

  async put(endpoint, body) {
    return safeFetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint) {
    return safeFetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  /** Handles image/document uploads (multipart/form-data) */
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('quickfix_token');
    const headers = { 'bypass-tunnel-reminder': '1' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return safeFetch(`${BASE_URL}/provider/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
};
