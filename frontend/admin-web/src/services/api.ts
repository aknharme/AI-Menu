import axios from 'axios';

// Admin tarafındaki tüm HTTP istekleri bu ortak axios instance üzerinden geçer.
const api = axios.create({
  // API adresi .env üzerinden değiştirilebilir, yoksa lokal varsayılan kullanılır.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5268/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
