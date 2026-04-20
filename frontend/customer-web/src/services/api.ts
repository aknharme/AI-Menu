import axios from 'axios';

// Tüm API istekleri tek axios instance üzerinden yönetilir.
const api = axios.create({
  // Ortam değişkeni yoksa lokal geliştirme API adresi kullanılır.
  // Docker: http://api:5000/api | Lokal: http://localhost:5000/api
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
