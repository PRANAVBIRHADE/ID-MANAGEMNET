import axios from 'axios';

// ✅ Use the full backend URL from .env (works on Vercel)
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Check if BASE_URL is set
if (!BASE_URL) {
  console.error('❌ REACT_APP_BACKEND_URL is not set!');
  console.error('Please set REACT_APP_BACKEND_URL in your Vercel environment variables');
  console.error('Example: https://your-backend-service.onrender.com');
}

const api = axios.create({
  baseURL: BASE_URL || 'http://localhost:5000', // Fallback to localhost for development
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
