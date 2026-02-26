import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        const path = window.location.pathname;
        if (!path.includes('/login') && !path.includes('/register')) {
          localStorage.removeItem('luxe_token');
          localStorage.removeItem('luxe_user');
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { message: data.message || 'Session expired' },
          }));
        }
      }

      return Promise.reject({
        status,
        message: data.message || 'Something went wrong',
        errors: data.errors || [],
      });
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 408,
        message: 'Request timed out. Please try again.',
      });
    }

    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
    });
  }
);

export default api;