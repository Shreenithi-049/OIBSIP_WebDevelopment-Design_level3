import axios from 'axios';

// VITE_API_URL must end with /api, e.g. https://your-backend.onrender.com/api
// Falls back to /api for local dev (Vite proxy handles it via vite.config.js)
const baseURL = import.meta.env.VITE_API_URL || '/api';

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not set. Using Vite proxy fallback (/api). This will break in production.');
}

const api = axios.create({ baseURL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
