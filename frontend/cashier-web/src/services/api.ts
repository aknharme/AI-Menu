import axios from 'axios';

// Kasiyer tarafındaki API çağrıları için ortak axios instance.
const api = axios.create({
  // API base URL .env ile ortam bazlı değiştirilebilir.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
