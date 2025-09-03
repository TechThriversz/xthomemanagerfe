import axios from 'axios';
import { CONFIG } from '../../config';

// The baseURL is now dynamically set using the value from our CONFIG object.
// We append '/api' to the end of the base URL.
const api = axios.create({
    baseURL: `${CONFIG.BASE_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Use console.debug for less critical logs
        console.debug('API: No token found in localStorage');
    }
    return config;
}, (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
});

// Auth API endpoints
export const login = (data) => {
    console.log('API login request:', data);
    return api.post('/auth/login', data);
};
export const register = (data) => api.post('/auth/register', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data); // Added
export const resetPassword = (data) => api.post('/auth/reset-password', data); // Added
export const inviteViewer = (email, fullName, adminId, recordName) =>
    api.post('/auth/invite', { email, fullName, adminId, recordName });
export const revokeViewer = (viewerId, recordName) =>
    api.post('/auth/revoke', { viewerId, recordName });

// Record API endpoints
export const getRecords = () => api.get('/record');
export const createRecord = (record) => {
    console.log('API createRecord payload:', record);
    return api.post('/record', record);
};
export const deleteRecord = (id) => api.delete(`/record/${id}`);

// Milk API endpoints
export const getMilk = (recordId) => api.get(`/milk/${recordId}`);
export const createMilk = (data) => {
    console.log('createMilk: Sending request with payload:', JSON.stringify(data));
    return api.post('/milk', data);
};
export const deleteMilk = (id) => api.delete(`/milk/${id}`);

// Bills API endpoints
export const getBills = (recordId) => api.get(`/bills/${recordId}`);
export const createBill = (bill) => {
    console.log('API createBill payload:', bill);
    return api.post('/bills', bill, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteBill = (id) => api.delete(`/bills/${id}`);

// Rent API endpoints
export const getRent = (recordId) => api.get(`/rent/${recordId}`);
export const createRent = (rent) => {
    console.log('API createRent payload:', rent);
    return api.post('/rent', rent);
};
export const deleteRent = (id) => api.delete(`/rent/${id}`);

// Analytics API endpoints
export const getMilkAnalytics = (recordId, month) => api.get(`/milk/analytics/${recordId}?month=${month}`);
export const getBillsAnalytics = (recordId, month) => api.get(`/bills/analytics/${recordId}?month=${month}`);
export const getRentAnalytics = (recordId, month) => api.get(`/rent/analytics/${recordId}?month=${month}`);

// Settings API endpoints
export const getSettings = () => api.get('/settings');
export const updateSettings = (settings) => api.post('/settings', settings);
export const updateUser = (id, formData) => api.put(`/user/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Dashboard API endpoints
export const getDashboardSummary = () => api.get('/dashboard/summary');