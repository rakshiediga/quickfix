/**
 * API Wrapper for FastAPI backend
 * Gateway path: http://localhost:8000/api/v1
 */

const getBaseUrl = () => {
  const customIp = localStorage.getItem('quickfix_custom_api_ip');
  if (customIp) {
    return `http://${customIp}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
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
      throw new Error('⚠️ Backend server is not running. Please start the FastAPI server first:\n\ncd backend\nuvicorn app.main:app --reload --port 8000');
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
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return safeFetch(`${BASE_URL}/provider/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
};
