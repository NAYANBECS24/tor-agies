import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        store.dispatch(logout());
        window.location.href = '/login';
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        // You can redirect to unauthorized page or show message
        console.error('Access forbidden');
      }
      
      // Handle 500 Internal Server Error
      if (error.response.status === 500) {
        console.error('Server error occurred');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;