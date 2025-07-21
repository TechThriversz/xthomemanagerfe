import axios from 'axios';

const api = axios.create({
    baseURL: 'https://hmapi.somee.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const inviteViewer = (email, fullName, adminId, recordName, recordType) =>
    api.post('/auth/invite', { email, fullName, adminId, recordName, recordType });
export const revokeViewer = (viewerId, recordName, recordType) =>
    api.post('/auth/revoke', { viewerId, recordName, recordType });
export const getRecords = () => api.get('/record');
export const createRecord = (record) => api.post('/record', record);
export const getMilk = (recordId) => api.get(`/milk/${recordId}`);
export const createMilk = (milk) => api.post('/milk', milk);
export const getBills = (recordId) => api.get(`/bills/${recordId}`);
export const createBill = (bill) => api.post('/bills', bill);
export const getRent = (recordId) => api.get(`/rent/${recordId}`);
export const createRent = (rent) => api.post('/rent', rent);
export const getMilkAnalytics = (recordId, month) => api.get(`/milk/analytics/${recordId}?month=${month}`);
export const getBillsAnalytics = (recordId, month) => api.get(`/bills/analytics/${recordId}?month=${month}`);
export const getRentAnalytics = (recordId, month) => api.get(`/rent/analytics/${recordId}?month=${month}`);
export const getSettings = () => api.get('/settings');
export const updateSettings = (settings) => api.post('/settings', settings);