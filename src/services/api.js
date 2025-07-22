import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7266/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API request with token:', token.substring(0, 20) + '...'); // Debug token (shortened)
    } else {
        console.warn('API: No token found in localStorage');
    }
    return config;
}, (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
});

export const login = (data) => {
    console.log('API login request:', data);
    return api.post('/auth/login', data);
};
export const register = (data) => api.post('/auth/register', data);
export const inviteViewer = (email, fullName, adminId, recordName) =>
    api.post('/auth/invite', { email, fullName, adminId, recordName });
export const revokeViewer = (viewerId, recordName) =>
    api.post('/auth/revoke', { viewerId, recordName });
export const getRecords = () => api.get('/record');
export const createRecord = (record) => {
    console.log('API createRecord payload:', record);
    return api.post('/record', record);
};
export const deleteRecord = (id) => api.delete(`/record/${id}`);
export const getMilk = (recordId) => api.get(`/milk/${recordId}`);
export const createMilk = (milk) => api.post('/milk', milk);
export const deleteMilk = (id) => api.delete(`/milk/${id}`);
export const getBills = (recordId) => api.get(`/bills/${recordId}`);
export const createBill = (bill) => api.post('/bills', bill, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteBill = (id) => api.delete(`/bills/${id}`);
export const getRent = (recordId) => api.get(`/rent/${recordId}`);
export const createRent = (rent) => api.post('/rent', rent);
export const deleteRent = (id) => api.delete(`/rent/${id}`);
export const getMilkAnalytics = (recordId, month) => api.get(`/milk/analytics/${recordId}?month=${month}`);
export const getBillsAnalytics = (recordId, month) => api.get(`/bills/analytics/${recordId}?month=${month}`);
export const getRentAnalytics = (recordId, month) => api.get(`/rent/analytics/${recordId}?month=${month}`);
export const getSettings = () => api.get('/settings');
export const updateSettings = (settings) => api.post('/settings', settings);
export const updateUser = (id, formData) => api.put(`/user/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});