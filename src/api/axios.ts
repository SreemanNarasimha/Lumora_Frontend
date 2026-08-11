import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.warn("VITE_API_URL is not set in the environment variables!");
}

const api = axios.create({
  baseURL: API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        const baseUrl = API_URL || 'http://localhost:8080/api';
        await axios.post(`${baseUrl}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
