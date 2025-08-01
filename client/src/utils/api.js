import axios from 'axios';

// ✅ Use the full backend URL from .env (works on Vercel)
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: BASE_URL, // Full backend base URL
});

// ✅ Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
