import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ton-backend.render.com/api',
});

// Intercepteur pour ajouter le JWT plus tard
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // ou Pinia store plus tard
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;