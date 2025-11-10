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
        console.debug('API: No token found in localStorage');
    }
    return config;
}, (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
});

// Auth API endpoints
export const login = (data) => {
    return api.post('/auth/login', data);
};
export const register = (data) => api.post('/auth/register', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
// export const inviteViewer = (email, recordName) =>
//     api.post('/auth/invite', { email, recordName });
export const inviteViewer = (email, recordName, recordId, ) =>
    api.post('/auth/invite', { email, recordName, recordId });
export const revokeViewer = (viewerId, recordId) =>
    api.post('/auth/revoke', { viewerId, recordId });
export const getInvitedViewers = (adminId) => api.get(`/auth/invited-viewers/${adminId}`);

// Record API endpoints
export const getRecords = () => api.get('/record');
export const createRecord = (record) => {

  return api.post('/record', { name: record.name, type: record.type }); // Only send name and type
};
export const deleteRecord = (id) => api.delete(`/record/${id}`);
export const getViewerRecords = (userId) => api.get(`/record/viewer-records/${userId}`); // New endpoint
export const getRecordDetails = (recordId) => api.get(`/record/details/${recordId}`);
export const acceptInvite = (recordId) => 
  api.post(`/record/accept-invite/${recordId}`);

export const declineInvite = (recordId) => 
  api.post(`/record/decline-invite/${recordId}`);

// Milk API endpoints
export const getMilk = (recordId) => api.get(`/milk/${recordId}`);
export const createMilk = (data) => {
 
    return api.post('/milk', data);
};
export const deleteMilk = (id) => api.delete(`/milk/${id}`);

// Bills API endpoints
export const getBills = (recordId) => api.get(`/bills/${recordId}`);
export const createBill = (bill) => {

    return api.post('/bills', bill, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteBill = (id) => api.delete(`/bills/${id}`);

// Rent API endpoints
export const getRent = (recordId) => api.get(`/rent/${recordId}`);
export const createRent = (rent) => {

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
export const getCurrentUser = () => api.get('/user/me');

// Dashboard API endpoints
export const getDashboardSummary = () => api.get('/dashboard/summary');

// Admin API endpoints
export const getUsers = () => api.get('/admin/users');
export const toggleUserStatus = (userId) => api.patch(`/admin/users/${userId}/toggle`);
export const updateUserPermissions = (userId, permissions) => {
  return api.patch(`/admin/users/${userId}/permissions`, permissions);
};

export const requestProUpgrade = () => api.post('/admin/upgrade/request');
export const approveProUpgrade = (userId) => api.post(`/admin/upgrade/approve/${userId}`);

// Password Vault API endpoints
export const getPasswords = () => api.get('/password');
export const addPassword = (data) => api.post('/password', data);
export const updatePassword = (id, data) => api.put(`/password/${id}`, data);
export const deletePassword = (id) => api.delete(`/password/${id}`);


// Family Member API endpoints
// Family Tree
export const getFamilyTree = () => api.get('/family/tree');
export const addFamilyMember = (data) => api.post('/family/tree', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateFamilyMember = (id, data) => api.put(`/family/tree/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteFamilyMember = (id) => api.delete(`/family/tree/${id}`);

// Other Members
export const getOtherMembers = () => api.get('/othermember');
export const addOtherMember = (data) => api.post('/othermember', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateOtherMember = (id, data) => api.put(`/othermember/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteOtherMember = (id) => api.delete(`/othermember/${id}`);

