import axios from 'axios';

const API_URL = 'https://hmapi.somee.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const inviteViewer = (email, adminId) =>
  api.post('/auth/invite', { email, adminId });

export const getMilk = () => api.get('/milk');
export const createMilk = (milkData) => api.post('/milk', milkData);
export const getBills = () => api.get('/bills');
export const createBill = (billData) => api.post('/bills', billData);
export const getRent = () => api.get('/rent');
export const createRent = (rentData) => api.post('/rent', rentData);

export default api;