import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token; for FormData, drop Content-Type so browser sets multipart boundary
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function isAuthLoginRequest(config: { url?: string; baseURL?: string } | undefined): boolean {
  if (!config) return false;
  const path = (config.url ?? '').split('?')[0];
  return (
    path.includes('/auth/login') ||
    path.includes('/auth/admin/login') ||
    path.includes('/auth/app/login')
  );
}

// Response interceptor - handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if the failed request was a login attempt (show error on form instead)
      if (!isAuthLoginRequest(error.config)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
