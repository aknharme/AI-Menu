import axios from 'axios';
import { clearAuthSession, getStoredToken } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5268/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cashier panel istekleri token varsa otomatik olarak Authorization header ile gider.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token suresi dolarsa kasiyer oturumu temizlenir ve kullanici login ekranina doner.
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
