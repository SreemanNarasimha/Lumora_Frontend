import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

// Ensure we don't append /api twice
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = `${API_URL}/api`;
}

if (!API_URL) {
  console.warn("VITE_API_URL is not set in the environment variables!");
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
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
