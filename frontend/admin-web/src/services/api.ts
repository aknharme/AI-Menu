import axios from 'axios';
import { clearAuthSession, getStoredToken } from './authStorage';

// Admin tarafındaki tüm HTTP istekleri bu ortak axios instance üzerinden geçer.
const api = axios.create({
  // API adresi .env üzerinden değiştirilebilir, yoksa lokal varsayılan kullanılır.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5268/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token varsa admin panel isteklerine otomatik Bearer header eklenir.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token gecersiz veya suresi dolmussa oturum temizlenip login sayfasina donulur.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
